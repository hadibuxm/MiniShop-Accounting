'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatPKR } from '@/lib/format';

export interface RecentTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category_name: string;
  payment_method: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa';
  amount: number;
  description: string | null;
}

function truncate(text: string | null, length: number): string {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function RecentTransactions({ transactions }: { transactions: RecentTransaction[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t('dashboard.recentTransactions')}</h2>
        <Link href="/transactions" className="text-sm text-gray-600 underline">
          {t('common.viewAll')}
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">{t('common.emptyRecord')}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                <td className="px-2 py-2">{tx.date}</td>
                <td className="px-2 py-2">
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
                <td className="px-2 py-2">{tx.category_name}</td>
                <td className="px-2 py-2">{t(`paymentMethods.${tx.payment_method}`)}</td>
                <td className="px-2 py-2">{formatPKR(tx.amount)}</td>
                <td className="px-2 py-2">{truncate(tx.description, 40)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
