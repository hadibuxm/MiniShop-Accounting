import { getDb } from '@/lib/db';

export interface TransactionRow {
  id: string;
  date: string;
  category_name: string;
  payment_method: string;
  amount: number;
  description: string | null;
  type: 'income' | 'expense';
}

export interface CategoryBreakdown {
  category_name: string;
  total: number;
}

export function sumByType(userId: string, dateFrom: string, dateTo: string, type: 'income' | 'expense'): number {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
       WHERE user_id = ? AND type = ? AND date BETWEEN ? AND ?`
    )
    .get(userId, type, dateFrom, dateTo) as { total: number };
  return row.total;
}

function transactionsInRange(userId: string, dateFrom: string, dateTo: string): TransactionRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT t.id, t.date, c.name AS category_name, t.payment_method, t.amount, t.description, t.type
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.date BETWEEN ? AND ?
       ORDER BY t.date DESC, t.created_at DESC`
    )
    .all(userId, dateFrom, dateTo) as TransactionRow[];
}

function categoryBreakdown(
  userId: string,
  dateFrom: string,
  dateTo: string,
  type: 'income' | 'expense'
): CategoryBreakdown[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT c.name AS category_name, SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.type = ? AND t.date BETWEEN ? AND ?
       GROUP BY c.name
       ORDER BY total DESC`
    )
    .all(userId, type, dateFrom, dateTo) as CategoryBreakdown[];
}

export function getDailyReport(userId: string, date: string) {
  const total_income = sumByType(userId, date, date, 'income');
  const total_expenses = sumByType(userId, date, date, 'expense');
  return {
    date,
    total_income,
    total_expenses,
    net_balance: total_income - total_expenses,
    transactions: transactionsInRange(userId, date, date),
  };
}

export function getRangeReport(userId: string, dateFrom: string, dateTo: string) {
  const total_income = sumByType(userId, dateFrom, dateTo, 'income');
  const total_expenses = sumByType(userId, dateFrom, dateTo, 'expense');
  return {
    total_income,
    total_expenses,
    net: total_income - total_expenses,
    income_by_category: categoryBreakdown(userId, dateFrom, dateTo, 'income'),
    expense_by_category: categoryBreakdown(userId, dateFrom, dateTo, 'expense'),
  };
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}
