import { useTranslation } from 'react-i18next';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'jazzcash', 'easypaisa'];

export default function TransactionFilters({ filters, categories, onChange, onApply, onClear }) {
  const { t } = useTranslation();

  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="filters">
      <label>
        {t('transactions.filter_start_date')}
        <input type="date" value={filters.start_date} onChange={(e) => update('start_date', e.target.value)} />
      </label>
      <label>
        {t('transactions.filter_end_date')}
        <input type="date" value={filters.end_date} onChange={(e) => update('end_date', e.target.value)} />
      </label>
      <label>
        {t('transactions.type')}
        <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
          <option value="">{t('transactions.filter_type')}</option>
          <option value="income">{t('transactions.income')}</option>
          <option value="expense">{t('transactions.expense')}</option>
        </select>
      </label>
      <label>
        {t('transactions.category')}
        <select value={filters.category_id} onChange={(e) => update('category_id', e.target.value)}>
          <option value="">{t('transactions.filter_category')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('transactions.payment_method')}
        <select value={filters.payment_method} onChange={(e) => update('payment_method', e.target.value)}>
          <option value="">{t('transactions.filter_payment_method')}</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {t(`transactions.${method}`)}
            </option>
          ))}
        </select>
      </label>
      <div className="filters-actions">
        <button type="button" onClick={onApply}>
          {t('transactions.apply_filters')}
        </button>
        <button type="button" onClick={onClear}>
          {t('transactions.clear_filters')}
        </button>
      </div>
    </div>
  );
}
