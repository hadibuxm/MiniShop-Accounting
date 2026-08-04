import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { loginSchema, BILINGUAL_ERRORS } from '@/lib/validation';
import { comparePassword, signSessionToken, authCookieOptions, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.invalidCredentials }, { status: 401 });
  }

  const { email, password } = parsed.data;
  const db = getDb();
  const user = db
    .prepare('SELECT id, full_name, shop_name, email, password_hash FROM users WHERE email = ?')
    .get(email) as
    | { id: string; full_name: string; shop_name: string; email: string; password_hash: string }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.invalidCredentials }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: BILINGUAL_ERRORS.invalidCredentials }, { status: 401 });
  }

  const token = await signSessionToken({ userId: user.id });
  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        full_name: user.full_name,
        shop_name: user.shop_name,
        email: user.email,
      },
    },
    { status: 200 }
  );
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(request));
  return response;
}
