import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

export default function TransactionsTable({ transactions, onEdit, onDelete }) {
  const { t } = useTranslation();

  if (!transactions || transactions.length === 0) {
    return <p className="empty-state">{t('transactions.no_transactions')}</p>;
  }

  return (
    <table className="transactions-table">
      <thead>
        <tr>
          <th>{t('transactions.date')}</th>
          <th>{t('transactions.type')}</th>
          <th>{t('transactions.category')}</th>
          <th>{t('transactions.payment_method')}</th>
          <th>{t('transactions.amount')}</th>
          <th>{t('transactions.description')}</th>
          <th>{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((txn) => (
          <tr key={txn.id}>
            <td>{txn.date}</td>
            <td>
              <span className={`type-badge type-badge--${txn.type}`}>{t(`transactions.${txn.type}`)}</span>
            </td>
            <td>{txn.Category ? txn.Category.name : ''}</td>
            <td>{t(`transactions.${txn.payment_method}`)}</td>
            <td>{formatCurrency(txn.amount)}</td>
            <td className="txn-description">{txn.description}</td>
            <td>
              <button type="button" onClick={() => onEdit(txn)}>
                {t('common.edit')}
              </button>
              <button type="button" onClick={() => onDelete(txn)}>
                {t('common.delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
