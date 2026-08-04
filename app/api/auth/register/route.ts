import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { registerSchema, BILINGUAL_ERRORS } from '@/lib/validation';
import { hashPassword, signSessionToken, authCookieOptions, AUTH_COOKIE_NAME } from '@/lib/auth';
import { DEFAULT_CATEGORIES } from '@/lib/defaultCategories';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? BILINGUAL_ERRORS.requiredField;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { full_name, shop_name, email, password } = parsed.data;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.duplicateEmail }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();

  const createUserAndSeed = db.transaction(() => {
    db.prepare(
      `INSERT INTO users (id, full_name, shop_name, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`
    ).run(userId, full_name, shop_name, email, passwordHash);

    const insertCategory = db.prepare(
      `INSERT INTO categories (id, user_id, name, type, is_default) VALUES (?, ?, ?, ?, 1)`
    );
    for (const category of DEFAULT_CATEGORIES) {
      insertCategory.run(uuidv4(), userId, category.name, category.type);
    }
  });

  createUserAndSeed();

  const token = await signSessionToken({ userId });
  const response = NextResponse.json(
    { user: { id: userId, full_name, shop_name, email } },
    { status: 201 }
  );
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(request));
  return response;
}
