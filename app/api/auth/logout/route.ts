import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

/**
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
