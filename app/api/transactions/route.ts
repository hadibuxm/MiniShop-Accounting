import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { transactionCreateSchema, transactionQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = transactionQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { page, limit, sort, date_from, date_to, type, category_id, payment_method } = parsed.data;
  const db = getDb();

  const conditions = ['t.user_id = ?'];
  const values: unknown[] = [user.id];

  if (date_from) {
    conditions.push('t.date >= ?');
    values.push(date_from);
  }
  if (date_to) {
    conditions.push('t.date <= ?');
    values.push(date_to);
  }
  if (type) {
    conditions.push('t.type = ?');
    values.push(type);
  }
  if (category_id) {
    conditions.push('t.category_id = ?');
    values.push(category_id);
  }
  if (payment_method) {
    conditions.push('t.payment_method = ?');
    values.push(payment_method);
  }

  const whereClause = conditions.join(' AND ');
  const orderClause =
    sort === 'date_asc' ? 't.date ASC, t.created_at ASC' : 't.date DESC, t.created_at DESC';

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total FROM transactions t WHERE ${whereClause}`)
    .get(...values) as { total: number };

  const offset = (page - 1) * limit;
  const rows = db
    .prepare(
      `SELECT t.id, t.user_id, t.category_id, c.name AS category_name, t.type, t.amount,
              t.date, t.payment_method, t.description, t.created_at, t.updated_at
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE ${whereClause}
       ORDER BY ${orderClause}
       LIMIT ? OFFSET ?`
    )
    .all(...values, limit, offset);

  return NextResponse.json(
    {
      data: rows,
      total: totalRow.total,
      page,
      totalPages: Math.max(1, Math.ceil(totalRow.total / limit)),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Invalid input';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { date, type, amount, category_id, payment_method, description } = parsed.data;
  const db = getDb();

  const category = db
    .prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?')
    .get(category_id, user.id);
  if (!category) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO transactions (id, user_id, category_id, type, amount, date, payment_method, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, category_id, type, amount, date, payment_method, description ?? null);

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  return NextResponse.json({ transaction }, { status: 201 });
}
