import { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export interface SessionUser {
  id: string;
  full_name: string;
  shop_name: string;
  email: string;
  language_preference: 'en' | 'ur';
}

async function loadUserByToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const db = getDb();
  const user = db
    .prepare(
      'SELECT id, full_name, shop_name, email, language_preference FROM users WHERE id = ?'
    )
    .get(payload.userId) as SessionUser | undefined;

  return user ?? null;
}

export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  return loadUserByToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export async function getSessionUserFromCookieStore(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): Promise<SessionUser | null> {
  return loadUserByToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}
