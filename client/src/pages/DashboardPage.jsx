import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDashboardSummary } from '../api/dashboard';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentTransactionsList from '../components/dashboard/RecentTransactionsList';
import TransactionForm from '../components/transactions/TransactionForm';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(() => {
    getDashboardSummary().then(setSummary);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSaved() {
    setShowForm(false);
    refresh();
  }

  if (!summary) return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <button type="button" onClick={() => setShowForm(true)}>
          {t('transactions.add_transaction')}
        </button>
      </div>

      <div className="summary-grid">
        <SummaryCard label={t('dashboard.today_income')} amount={summary.today.income} tone="income" />
        <SummaryCard label={t('dashboard.today_expense')} amount={summary.today.expense} tone="expense" />
        <SummaryCard
          label={t('dashboard.today_net')}
          amount={summary.today.net}
          tone={summary.today.net >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard label={t('dashboard.month_income')} amount={summary.month.income} tone="income" />
        <SummaryCard label={t('dashboard.month_expense')} amount={summary.month.expense} tone="expense" />
        <SummaryCard
          label={t('dashboard.month_net')}
          amount={summary.month.net}
          tone={summary.month.net >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <section>
        <h2>{t('dashboard.recent_transactions')}</h2>
        <RecentTransactionsList transactions={summary.recent_transactions} />
      </section>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}
    </div>
  );
}
