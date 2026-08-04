'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DEFAULT_CATEGORY_URDU_LABELS } from '@/lib/defaultCategories';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_default: number | boolean;
}

function CategoryRow({
  category,
  onRename,
  onDelete,
  renameError,
}: {
  category: Category;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  renameError: string | null;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const urduLabel = DEFAULT_CATEGORY_URDU_LABELS[category.name];
  const isUrdu = i18next.language === 'ur';

  const submitRename = () => {
    onRename(category.id, name);
    setEditing(false);
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 py-2 last:border-0">
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={submitRename}
            className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white"
          >
            {t('common.save')}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(category.name);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium"
          >
            {t('common.cancel')}
          </button>
          {renameError && <span className="text-xs text-red-600">{renameError}</span>}
        </div>
      ) : (
        <span className="text-sm">
          {category.name}
          {urduLabel ? (
            <span className="ms-2 text-gray-500">{isUrdu ? '' : `(${urduLabel})`}{isUrdu ? urduLabel : ''}</span>
          ) : null}
        </span>
      )}
      {!editing && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-100"
          >
            {t('common.edit')}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            {t('common.delete')}
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        message={t('categories.confirmDelete')}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(category.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  );
}

export function CategoryList({
  categories,
  type,
  onRename,
  onDelete,
  renameErrorFor,
}: {
  categories: Category[];
  type: 'income' | 'expense';
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  renameErrorFor: (id: string) => string | null;
}) {
  const { t } = useTranslation();
  const filtered = categories.filter((c) => c.type === type);

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold">
        {type === 'income' ? t('categories.incomeCategories') : t('categories.expenseCategories')}
      </h2>
      <ul>
        {filtered.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onRename={onRename}
            onDelete={onDelete}
            renameError={renameErrorFor(category.id)}
          />
        ))}
      </ul>
    </div>
  );
}
