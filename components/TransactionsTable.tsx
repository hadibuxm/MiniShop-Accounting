'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { formatPKR } from '@/lib/format';
import { Category } from '@/components/CategoryList';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category_id: string;
  category_name: string;
  payment_method: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa';
  amount: number;
  description: string | null;
}

export interface TransactionFilters {
  date_from: string;
  date_to: string;
  type: string;
  category_id: string;
  payment_method: string;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const data = await res.json();
  return data.categories;
}

function truncate(text: string | null, length: number): string {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function TransactionsTable({
  transactions,
  page,
  totalPages,
  onPageChange,
  filters,
  onFiltersChange,
  onClearFilters,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 rounded border border-gray-200 bg-white p-3">
        <div>
          <label className="mb-1 block text-xs font-medium">{t('transactions.dateFrom')}</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('transactions.dateTo')}</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('common.type')}</label>
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t('transactions.allTypes')}</option>
            <option value="income">{t('common.income')}</option>
            <option value="expense">{t('common.expense')}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('common.category')}</label>
          <select
            value={filters.category_id}
            onChange={(e) => onFiltersChange({ ...filters, category_id: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t('transactions.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">{t('common.paymentMethod')}</label>
          <select
            value={filters.payment_method}
            onChange={(e) => onFiltersChange({ ...filters, payment_method: e.target.value })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">{t('transactions.allPaymentMethods')}</option>
            <option value="cash">{t('paymentMethods.cash')}</option>
            <option value="bank_transfer">{t('paymentMethods.bank_transfer')}</option>
            <option value="jazzcash">{t('paymentMethods.jazzcash')}</option>
            <option value="easypaisa">{t('paymentMethods.easypaisa')}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
        >
          {t('common.clearFilters')}
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded border border-gray-200 bg-white p-4 text-sm text-gray-500">
          {t('common.emptyRecord')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="px-3 py-2">{t('common.date')}</th>
                <th className="px-3 py-2">{t('common.type')}</th>
                <th className="px-3 py-2">{t('common.category')}</th>
                <th className="px-3 py-2">{t('common.paymentMethod')}</th>
                <th className="px-3 py-2">{t('common.amount')}</th>
                <th className="px-3 py-2">{t('common.description')}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2">{tx.date}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        tx.type === 'income'
                          ? 'rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                          : 'rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'
                      }
                    >
                      {tx.type === 'income' ? t('common.income') : t('common.expense')}
                    </span>
                  </td>
                  <td className="px-3 py-2">{tx.category_name}</td>
                  <td className="px-3 py-2">{t(`paymentMethods.${tx.payment_method}`)}</td>
                  <td className="px-3 py-2">{formatPKR(tx.amount)}</td>
                  <td className="px-3 py-2">{truncate(tx.description, 40)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-100"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tx.id)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40"
        >
          {t('common.previous')}
        </button>
        <span className="text-sm text-gray-600">
          {t('common.page')} {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40"
        >
          {t('common.next')}
        </button>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={t('transactions.confirmDelete')}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
