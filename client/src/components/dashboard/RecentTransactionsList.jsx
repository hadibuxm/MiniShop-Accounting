import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

export default function RecentTransactionsList({ transactions }) {
  const { t } = useTranslation();

  if (!transactions || transactions.length === 0) {
    return <p className="empty-state">{t('dashboard.no_recent_transactions')}</p>;
  }

  return (
    <ul className="recent-transactions-list">
      {transactions.map((txn) => (
        <li key={txn.id} className="recent-transaction-item">
          <span className="txn-date">{txn.date}</span>
          <span className={`type-badge type-badge--${txn.type}`}>{t(`transactions.${txn.type}`)}</span>
          <span className="txn-category">{txn.Category ? txn.Category.name : ''}</span>
          <span className="txn-amount">{formatCurrency(txn.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
