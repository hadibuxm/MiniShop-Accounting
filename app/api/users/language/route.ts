import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { languagePatchSchema } from '@/lib/validation';

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = languagePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
  }

  const db = getDb();
  db.prepare(
    `UPDATE users SET language_preference = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(parsed.data.language_preference, user.id);

  return NextResponse.json({ ok: true }, { status: 200 });
}
