import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listTransactions, deleteTransaction } from '../api/transactions';
import { listCategories } from '../api/categories';
import TransactionsTable from '../components/transactions/TransactionsTable';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import DeleteConfirmDialog from '../components/transactions/DeleteConfirmDialog';

const EMPTY_FILTERS = { start_date: '', end_date: '', type: '', category_id: '', payment_method: '' };

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ transactions: [], pagination: { page: 1, total_pages: 1 } });
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  const refresh = useCallback(() => {
    const params = { page };
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    listTransactions(params).then(setData);
  }, [page, appliedFilters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function applyFilters() {
    setPage(1);
    setAppliedFilters(filters);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTransaction(null);
    refresh();
  }

  async function handleConfirmDelete() {
    await deleteTransaction(deletingTransaction.id);
    setDeletingTransaction(null);
    refresh();
  }

  const pagination = data.pagination || { page: 1, total_pages: 1 };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('transactions.title')}</h1>
        <button type="button" onClick={() => setShowForm(true)}>
          {t('transactions.add_transaction')}
        </button>
      </div>

      <TransactionFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onApply={applyFilters}
        onClear={clearFilters}
      />

      <TransactionsTable
        transactions={data.transactions}
        onEdit={setEditingTransaction}
        onDelete={setDeletingTransaction}
      />

      <div className="pagination">
        <button type="button" disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}>
          &laquo;
        </button>
        <span>
          {t('transactions.page')} {pagination.page} {t('transactions.of')} {pagination.total_pages}
        </span>
        <button
          type="button"
          disabled={pagination.page >= pagination.total_pages}
          onClick={() => setPage(pagination.page + 1)}
        >
          &raquo;
        </button>
      </div>

      {(showForm || editingTransaction) && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {deletingTransaction && (
        <DeleteConfirmDialog onCancel={() => setDeletingTransaction(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
}
