'use client';

import { useTranslation } from 'react-i18next';
import { formatPKR } from '@/lib/format';

export interface DashboardSummary {
  today: { income: number; expenses: number; net: number };
  month: { income: number; expenses: number; net: number };
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-lg font-semibold">{formatPKR(value)}</p>
    </div>
  );
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card title={t('dashboard.todayIncome')} value={summary.today.income} />
      <Card title={t('dashboard.todayExpenses')} value={summary.today.expenses} />
      <Card title={t('dashboard.todayNet')} value={summary.today.net} />
      <Card title={t('dashboard.monthIncome')} value={summary.month.income} />
      <Card title={t('dashboard.monthExpenses')} value={summary.month.expenses} />
      <Card title={t('dashboard.monthNet')} value={summary.month.net} />
    </div>
  );
}
