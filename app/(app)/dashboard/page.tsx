'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SummaryCards, DashboardSummary } from '@/components/SummaryCards';
import { RecentTransactions } from '@/components/RecentTransactions';
import { TransactionForm, TransactionFormValues } from '@/components/TransactionForm';

async function fetchSummary(): Promise<DashboardSummary> {
  const res = await fetch('/api/dashboard/summary');
  return res.json();
}

async function fetchRecent() {
  const res = await fetch('/api/dashboard/recent');
  const data = await res.json();
  return data.transactions;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: summary } = useQuery({ queryKey: ['dashboard-summary'], queryFn: fetchSummary });
  const { data: recent = [] } = useQuery({ queryKey: ['dashboard-recent'], queryFn: fetchRecent });

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
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('nav.dashboard')}</h1>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setFormOpen(true);
          }}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          {t('dashboard.addTransaction')}
        </button>
      </div>

      {summary && <SummaryCards summary={summary} />}
      <RecentTransactions transactions={recent} />

      {formOpen && (
        <TransactionForm
          submitting={createMutation.isPending}
          error={formError}
          onCancel={() => setFormOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      )}
    </div>
  );
}
