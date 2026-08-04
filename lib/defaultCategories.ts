export type CategoryType = 'income' | 'expense';

export interface DefaultCategory {
  name: string;
  type: CategoryType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Sales Revenue', type: 'income' },
  { name: 'Other Income', type: 'income' },
  { name: 'Rent', type: 'expense' },
  { name: 'Salaries & Wages', type: 'expense' },
  { name: 'Utilities (Bijli/Gas/Paani)', type: 'expense' },
  { name: 'Inventory / Stock Purchase', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Miscellaneous', type: 'expense' },
];

export const DEFAULT_CATEGORY_URDU_LABELS: Record<string, string> = {
  'Sales Revenue': 'فروخت آمدنی',
  'Other Income': 'دیگر آمدنی',
  Rent: 'کرایہ',
  'Salaries & Wages': 'تنخواہیں',
  'Utilities (Bijli/Gas/Paani)': 'بجلی / گیس / پانی',
  'Inventory / Stock Purchase': 'اسٹاک خریداری',
  Transport: 'ٹرانسپورٹ',
  Miscellaneous: 'متفرق',
};
