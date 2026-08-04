import { formatCurrency } from '../../utils/formatCurrency';

export default function SummaryCard({ label, amount, tone }) {
  return (
    <div className={`summary-card summary-card--${tone || 'neutral'}`}>
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-amount">{formatCurrency(amount)}</div>
    </div>
  );
}
