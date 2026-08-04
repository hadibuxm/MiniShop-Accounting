import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const transactions = db
    .prepare(
      `SELECT t.id, t.date, t.type, c.name AS category_name, t.payment_method, t.amount, t.description
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ?
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT 5`
    )
    .all(user.id);

  return NextResponse.json({ transactions }, { status: 200 });
}
