import { z } from 'zod';

export const BILINGUAL_ERRORS = {
  passwordRule:
    'Password must be at least 8 characters and contain at least one number / پاس ورڈ کم از کم 8 حروف پر مشتمل ہو اور کم از کم ایک نمبر ہو',
  invalidCredentials: 'Invalid email or password / ای میل یا پاس ورڈ غلط ہے',
  duplicateEmail: 'An account with this email already exists / اس ای میل سے پہلے ہی اکاؤنٹ موجود ہے',
  duplicateCategory: 'A category with this name already exists / اس نام کی کیٹیگری پہلے سے موجود ہے',
  categoryHasTransactions:
    'Cannot delete a category with existing transactions / اس کیٹیگری میں ٹرانزیکشنز موجود ہیں، حذف نہیں کی جا سکتی',
  emptyName: 'Name is required / نام درکار ہے',
  requiredField: 'This field is required / یہ خانہ ضروری ہے',
  invalidAmount: 'Amount must be a positive number / رقم مثبت نمبر ہونی چاہیے',
  futureDate: 'Date cannot be in the future / تاریخ مستقبل میں نہیں ہو سکتی',
  endBeforeStart:
    'End date cannot be before start date / اختتامی تاریخ شروعاتی تاریخ سے پہلے نہیں ہو سکتی',
  emptyRecord: 'Koi record nahi mila / No records found',
} as const;

function isValidPassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

const todayString = () => new Date().toISOString().slice(0, 10);

export const registerSchema = z.object({
  full_name: z.string().min(1, BILINGUAL_ERRORS.requiredField).max(100),
  shop_name: z.string().min(1, BILINGUAL_ERRORS.requiredField).max(150),
  email: z.string().email(BILINGUAL_ERRORS.requiredField).max(255),
  password: z.string().refine(isValidPassword, BILINGUAL_ERRORS.passwordRule),
});

export const loginSchema = z.object({
  email: z.string().email(BILINGUAL_ERRORS.invalidCredentials),
  password: z.string().min(1, BILINGUAL_ERRORS.invalidCredentials),
});

export const languagePatchSchema = z.object({
  language_preference: z.enum(['en', 'ur']),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, BILINGUAL_ERRORS.emptyName).max(100),
  type: z.enum(['income', 'expense']),
});

export const categoryRenameSchema = z.object({
  name: z.string().trim().min(1, BILINGUAL_ERRORS.emptyName).max(100),
});

export const paymentMethods = ['cash', 'bank_transfer', 'jazzcash', 'easypaisa'] as const;

export const transactionCreateSchema = z.object({
  date: z
    .string()
    .refine((d) => /^\d{4}-\d{2}-\d{2}$/.test(d), BILINGUAL_ERRORS.requiredField)
    .refine((d) => d <= todayString(), BILINGUAL_ERRORS.futureDate),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(BILINGUAL_ERRORS.invalidAmount),
  category_id: z.string().min(1, BILINGUAL_ERRORS.requiredField),
  payment_method: z.enum(paymentMethods),
  description: z.string().max(255).optional().nullable(),
});

export const transactionUpdateSchema = z.object({
  date: z
    .string()
    .refine((d) => /^\d{4}-\d{2}-\d{2}$/.test(d), BILINGUAL_ERRORS.requiredField)
    .refine((d) => d <= todayString(), BILINGUAL_ERRORS.futureDate)
    .optional(),
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive(BILINGUAL_ERRORS.invalidAmount).optional(),
  category_id: z.string().min(1).optional(),
  payment_method: z.enum(paymentMethods).optional(),
  description: z.string().max(255).optional().nullable(),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['date_desc', 'date_asc']).default('date_desc'),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category_id: z.string().optional(),
  payment_method: z.enum(paymentMethods).optional(),
});

export const dailyReportQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
});

export const customReportQuerySchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: BILINGUAL_ERRORS.endBeforeStart,
    path: ['end_date'],
  });

export const pdfExportSchema = z.object({
  report_type: z.enum(['daily', 'monthly', 'custom']),
  params: z.record(z.string()),
});
