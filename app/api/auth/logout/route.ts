import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: request.headers.get('x-forwarded-proto') === 'https',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
