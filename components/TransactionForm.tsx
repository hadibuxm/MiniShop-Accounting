'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@/components/CategoryList';

export interface TransactionFormValues {
  date: string;
  type: 'income' | 'expense';
  amount: string;
  category_id: string;
  payment_method: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa';
  description: string;
}

const todayString = () => new Date().toISOString().slice(0, 10);

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const data = await res.json();
  return data.categories;
}

export function TransactionForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting,
  error,
}: {
  initialValues?: Partial<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [date, setDate] = useState(initialValues?.date ?? todayString());
  const [type, setType] = useState<'income' | 'expense'>(initialValues?.type ?? 'income');
  const [amount, setAmount] = useState(initialValues?.amount ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<TransactionFormValues['payment_method']>(
    initialValues?.payment_method ?? 'cash'
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const categoriesForType = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (categoriesForType.length > 0 && !categoriesForType.some((c) => c.id === categoryId)) {
      setCategoryId(categoriesForType[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!date) errors.date = t('common.requiredField');
    else if (date > todayString()) errors.date = t('transactions.errorFutureDate');
    if (!amount || Number(amount) <= 0) errors.amount = t('transactions.errorInvalidAmount');
    if (!categoryId) errors.category_id = t('common.requiredField');
    if (!paymentMethod) errors.payment_method = t('common.requiredField');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ date, type, amount, category_id: categoryId, payment_method: paymentMethod, description });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-3 rounded-lg bg-white p-5 shadow-lg"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.date')}</label>
          <input
            type="date"
            value={date}
            max={todayString()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.date && <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.type')}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="income">{t('common.income')}</option>
            <option value="expense">{t('common.expense')}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.amount')}</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.amount && <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.category')}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {categoriesForType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.category_id && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.category_id}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.paymentMethod')}</label>
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as TransactionFormValues['payment_method'])
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="cash">{t('paymentMethods.cash')}</option>
            <option value="bank_transfer">{t('paymentMethods.bank_transfer')}</option>
            <option value="jazzcash">{t('paymentMethods.jazzcash')}</option>
            <option value="easypaisa">{t('paymentMethods.easypaisa')}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('common.description')}</label>
          <textarea
            value={description}
            maxLength={255}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            rows={2}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
