'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TransactionsTable, Transaction, TransactionFilters } from '@/components/TransactionsTable';
import { TransactionForm, TransactionFormValues } from '@/components/TransactionForm';

const EMPTY_FILTERS: TransactionFilters = {
  date_from: '',
  date_to: '',
  type: '',
  category_id: '',
  payment_method: '',
};

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

async function fetchTransactions(page: number, filters: TransactionFilters): Promise<TransactionsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: '20', sort: 'date_desc' });
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.type) params.set('type', filters.type);
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.payment_method) params.set('payment_method', filters.payment_method);

  const res = await fetch(`/api/transactions?${params.toString()}`);
  return res.json();
}

export default function TransactionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () => fetchTransactions(page, filters),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] });
  };

  const createMutation = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, amount: Number(values.amount) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.transaction;
    },
    onSuccess: () => {
      setFormOpen(false);
      setFormError(null);
      invalidateAll();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TransactionFormValues }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, amount: Number(values.amount) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.transaction;
    },
    onSuccess: () => {
      setFormOpen(false);
      setEditingTransaction(null);
      setFormError(null);
      invalidateAll();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: invalidateAll,
  });

  const openAddForm = () => {
    setEditingTransaction(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormError(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('transactions.title')}</h1>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          {t('transactions.addTransaction')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      ) : (
        <TransactionsTable
          transactions={data?.data ?? []}
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
          filters={filters}
          onFiltersChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          onClearFilters={() => {
            setFilters(EMPTY_FILTERS);
            setPage(1);
          }}
          onEdit={openEditForm}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {formOpen && (
        <TransactionForm
          initialValues={
            editingTransaction
              ? {
                  date: editingTransaction.date,
                  type: editingTransaction.type,
                  amount: String(editingTransaction.amount),
                  category_id: editingTransaction.category_id,
                  payment_method: editingTransaction.payment_method,
                  description: editingTransaction.description ?? '',
                }
              : undefined
          }
          submitting={createMutation.isPending || updateMutation.isPending}
          error={formError}
          onCancel={() => setFormOpen(false)}
          onSubmit={(values) => {
            if (editingTransaction) {
              updateMutation.mutate({ id: editingTransaction.id, values });
            } else {
              createMutation.mutate(values);
            }
          }}
        />
      )}
    </div>
  );
}
