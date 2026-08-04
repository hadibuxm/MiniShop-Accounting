import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateCategory, deleteCategory } from '../../api/categories';

function CategoryRow({ category, onChanged }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState(null);

  async function handleRename() {
    if (!name.trim() || name.trim() === category.name) {
      setEditing(false);
      setName(category.name);
      return;
    }
    try {
      await updateCategory(category.id, { name: name.trim() });
      setEditing(false);
      setError(null);
      onChanged();
    } catch (err) {
      const code = err.response?.data?.code;
      setError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    }
  }

  async function handleDelete() {
    try {
      await deleteCategory(category.id);
      setError(null);
      onChanged();
    } catch (err) {
      const code = err.response?.data?.code;
      setError(code ? t(`errors.${code}`) : t('errors.INTERNAL_ERROR'));
    }
  }

  return (
    <li className="category-row">
      {editing ? (
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      ) : (
        <span>{category.name}</span>
      )}

      <div className="category-actions">
        {editing ? (
          <>
            <button type="button" onClick={handleRename}>
              {t('common.save')}
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)}>
              {t('categories.rename')}
            </button>
            <button type="button" onClick={handleDelete}>
              {t('common.delete')}
            </button>
          </>
        )}
      </div>

      {error && <span className="field-error">{error}</span>}
    </li>
  );
}

export default function CategoryList({ categories, type, onChanged }) {
  const { t } = useTranslation();
  const filtered = categories.filter((c) => c.type === type);

  return (
    <div className="category-list">
      <h2>{t(type === 'income' ? 'transactions.income' : 'transactions.expense')}</h2>
      {filtered.length === 0 ? (
        <p className="empty-state">{t('categories.no_categories')}</p>
      ) : (
        <ul>
          {filtered.map((category) => (
            <CategoryRow key={category.id} category={category} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </div>
  );
}
