import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCategories } from '../../api/categories';
import { createTransaction, updateTransaction } from '../../api/transactions';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'jazzcash', 'easypaisa'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionForm({ transaction, onClose, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!transaction;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    type: transaction?.type || 'income',
    amount: transaction?.amount ?? '',
    category_id: transaction?.category_id || '',
    date: transaction?.date || todayISO(),
    payment_method: transaction?.payment_method || 'cash',
    description: transaction?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories);
  }, []);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.type) nextErrors.type = t('validation.required');
    if (!form.category_id) nextErrors.category_id = t('validation.required');
    if (!form.payment_method) nextErrors.payment_method = t('validation.required');

    if (!form.date) {
      nextErrors.date = t('validation.required');
    } else if (form.date > todayISO()) {
      nextErrors.date = t('validation.date_future');
    }

    const amountNumber = Number(form.amount);
    if (form.amount === '' || Number.isNaN(amountNumber)) {
      nextErrors.amount = t('validation.required');
    } else if (amountNumber <= 0) {
      nextErrors.amount = t('validation.positive_number');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSaving(true);
    const payload = { ...form, amount: Number(form.amount) };

    try {
      if (isEdit) {
        await updateTransaction(transaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      onSaved();
    } catch (err) {
      const code = err.response?.data?.code;
      setSubmitError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{isEdit ? t('transactions.edit_transaction') : t('transactions.add_transaction')}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            {t('transactions.type')}
            <select value={form.type} onChange={(e) => updateField('type', e.target.value)}>
              <option value="income">{t('transactions.income')}</option>
              <option value="expense">{t('transactions.expense')}</option>
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </label>

          <label>
            {t('transactions.date')}
            <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>

          <label>
            {t('transactions.amount')}
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => updateField('amount', e.target.value)}
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </label>

          <label>
            {t('transactions.category')}
            <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
              <option value="">--</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && <span className="field-error">{errors.category_id}</span>}
          </label>

          <label>
            {t('transactions.payment_method')}
            <select value={form.payment_method} onChange={(e) => updateField('payment_method', e.target.value)}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {t(`transactions.${method}`)}
                </option>
              ))}
            </select>
            {errors.payment_method && <span className="field-error">{errors.payment_method}</span>}
          </label>

          <label>
            {t('transactions.description')}
            <input
              type="text"
              maxLength={255}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </label>

          {submitError && <p className="form-error">{submitError}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving}>
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
