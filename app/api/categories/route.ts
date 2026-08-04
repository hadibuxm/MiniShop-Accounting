import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { categoryCreateSchema, BILINGUAL_ERRORS } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const db = getDb();
  const categories = db
    .prepare(
      `SELECT id, user_id, name, type, is_default, created_at, updated_at
       FROM categories WHERE user_id = ? ORDER BY type ASC, is_default DESC, name ASC`
    )
    .all(user.id);

  return NextResponse.json({ categories }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? BILINGUAL_ERRORS.emptyName;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, type } = parsed.data;
  const db = getDb();

  const existing = db
    .prepare('SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?')
    .get(user.id, name, type);
  if (existing) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.duplicateCategory }, { status: 409 });
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO categories (id, user_id, name, type, is_default) VALUES (?, ?, ?, ?, 0)`
  ).run(id, user.id, name, type);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  return NextResponse.json({ category }, { status: 201 });
}
