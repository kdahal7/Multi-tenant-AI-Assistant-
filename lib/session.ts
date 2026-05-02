import { ISession } from '@/types';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'ai-assistant-session';
const SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-key';

/**
 * Simplified authentication session management
 */

export function createSessionToken(userId: string, email: string, projectId: string, role: string, name: string): string {
  const token = jwt.sign(
    {
      userId,
      email,
      projectId,
      role,
      name,
    },
    SECRET,
    { expiresIn: '30d' }
  );

  return token;
}

export function verifySessionToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function getSessionFromCookie(): Promise<ISession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const decoded = verifySessionToken(token);

    if (!decoded) {
      return null;
    }

    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        projectId: decoded.projectId,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
