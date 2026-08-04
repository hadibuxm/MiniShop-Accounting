import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { transactionUpdateSchema } from '@/lib/validation';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(params.id) as { id: string; user_id: string } | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Invalid input';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const fields = parsed.data;

  if (fields.category_id) {
    const category = db
      .prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?')
      .get(fields.category_id, user.id);
    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length > 0) {
    updates.push(`updated_at = datetime('now')`);
    db.prepare(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`).run(
      ...values,
      params.id
    );
  }

  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(params.id);
  return NextResponse.json({ transaction: updated }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(params.id) as { id: string; user_id: string } | undefined;

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  db.prepare('DELETE FROM transactions WHERE id = ?').run(params.id);
  return new NextResponse(null, { status: 204 });
}
