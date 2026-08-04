'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CategoryForm({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (data: { name: string; type: 'income' | 'expense' }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded border border-gray-200 bg-white p-3">
      <div>
        <label className="mb-1 block text-xs font-medium">{t('categories.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">{t('common.type')}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="income">{t('common.income')}</option>
          <option value="expense">{t('common.expense')}</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {t('categories.addCategory')}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
