import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { categoryRenameSchema, BILINGUAL_ERRORS } from '@/lib/validation';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const category = db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .get(params.id) as { id: string; user_id: string; type: string } | undefined;

  if (!category || category.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryRenameSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? BILINGUAL_ERRORS.emptyName;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name } = parsed.data;

  const duplicate = db
    .prepare('SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ? AND id != ?')
    .get(user.id, name, category.type, category.id);
  if (duplicate) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.duplicateCategory }, { status: 409 });
  }

  db.prepare(`UPDATE categories SET name = ?, updated_at = datetime('now') WHERE id = ?`).run(
    name,
    category.id
  );

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(category.id);
  return NextResponse.json({ category: updated }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const category = db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .get(params.id) as { id: string; user_id: string } | undefined;

  if (!category || category.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const linked = db
    .prepare('SELECT COUNT(*) AS count FROM transactions WHERE category_id = ?')
    .get(category.id) as { count: number };

  if (linked.count > 0) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.categoryHasTransactions }, { status: 409 });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(category.id);
  return new NextResponse(null, { status: 204 });
}
