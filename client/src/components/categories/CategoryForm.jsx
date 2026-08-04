import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createCategory } from '../../api/categories';

export default function CategoryForm({ onSaved }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState('income');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('validation.required'));
      return;
    }
    try {
      await createCategory({ name: name.trim(), type });
      setName('');
      setError(null);
      onSaved();
    } catch (err) {
      const code = err.response?.data?.code;
      setError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={t('categories.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="income">{t('transactions.income')}</option>
        <option value="expense">{t('transactions.expense')}</option>
      </select>
      <button type="submit">{t('categories.add_category')}</button>
      {error && <span className="field-error">{error}</span>}
    </form>
  );
}
