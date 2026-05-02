import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { ProjectService, UserService } from '@/services';
import { createSessionToken, setSessionCookie } from '@/lib/session';
import { connectDB } from '@/lib/db';

/**
 * POST /api/auth/login - Simplified login (no password)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, projectSlug } = loginSchema.parse(body);

    // Get project
    const project = await ProjectService.getProjectBySlug(projectSlug);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get or create user
    const user = await UserService.getOrCreateUser(
      email,
      project._id.toString(),
      email.split('@')[0]
    );

    // Create session token
    const token = createSessionToken(
      user._id.toString(),
      user.email,
      user.projectId.toString(),
      user.role,
      user.name
    );

    // Set cookie
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      success: true,
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.errors) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
