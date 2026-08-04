import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCategories } from '../api/categories';
import CategoryForm from '../components/categories/CategoryForm';
import CategoryList from '../components/categories/CategoryList';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  const refresh = useCallback(() => {
    listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('categories.title')}</h1>
      </div>

      <CategoryForm onSaved={refresh} />

      <div className="category-lists">
        <CategoryList categories={categories} type="income" onChanged={refresh} />
        <CategoryList categories={categories} type="expense" onChanged={refresh} />
      </div>
    </div>
  );
}
