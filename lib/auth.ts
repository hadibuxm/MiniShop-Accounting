import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const BCRYPT_COST_FACTOR = 12;
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const AUTH_COOKIE_NAME = 'auth_token';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'mini-shop-accounting-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  [key: string]: unknown;
  userId: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function authCookieOptions(request: Request) {
  const proto = request.headers.get('x-forwarded-proto');
  const secure = proto === 'https';
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: JWT_EXPIRY_SECONDS,
  };
}
