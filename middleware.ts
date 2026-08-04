import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth_token';
const PUBLIC_PATHS = ['/login', '/register'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'mini-shop-accounting-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authed = await isAuthenticated(token);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!authed && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (authed && isPublicPath) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
