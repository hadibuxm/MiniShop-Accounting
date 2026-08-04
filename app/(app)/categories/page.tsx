'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CategoryList, Category } from '@/components/CategoryList';
import { CategoryForm } from '@/components/CategoryForm';

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const data = await res.json();
  return data.categories;
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string | null>(null);
  const [renameErrors, setRenameErrors] = useState<Record<string, string>>({});

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; type: 'income' | 'expense' }) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.category;
    },
    onSuccess: () => {
      setCreateError(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error) => setCreateError(err.message),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.category;
    },
    onSuccess: (_data, variables) => {
      setRenameErrors((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: Error, variables) => {
      setRenameErrors((prev) => ({ ...prev, [variables.id]: err.message }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: null }));
        throw new Error(data.error ?? 'Delete failed');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t('categories.title')}</h1>
      <CategoryForm
        submitting={createMutation.isPending}
        error={createError}
        onSubmit={(data) => createMutation.mutate(data)}
      />
      {isLoading ? (
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryList
            categories={categories}
            type="income"
            onRename={(id, name) => renameMutation.mutate({ id, name })}
            onDelete={(id) => deleteMutation.mutate(id)}
            renameErrorFor={(id) => renameErrors[id] ?? null}
          />
          <CategoryList
            categories={categories}
            type="expense"
            onRename={(id, name) => renameMutation.mutate({ id, name })}
            onDelete={(id) => deleteMutation.mutate(id)}
            renameErrorFor={(id) => renameErrors[id] ?? null}
          />
        </div>
      )}
      {deleteMutation.isError && (
        <p className="text-sm text-red-600">{(deleteMutation.error as Error).message}</p>
      )}
    </div>
  );
}
