import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';
import { updateDashboardConfigSchema } from '@/lib/validation';
import { DashboardService } from '@/services/dashboard';
import { accessControl } from '@/lib/middleware';

/**
 * GET /api/admin/dashboard - Get dashboard config
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    // Check if admin
    await accessControl.requireProjectAdmin(session.user.id, projectId);

    // Get dashboard config
    const config = await DashboardService.getDashboardConfig(projectId);

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/dashboard - Update dashboard config
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, ...data } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    // Check if admin
    await accessControl.requireProjectAdmin(session.user.id, projectId);

    // Validate update data
    const validatedData = updateDashboardConfigSchema.parse(data);

    // Update config
    const config = await DashboardService.updateDashboardConfig(
      projectId,
      validatedData
    );

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error updating dashboard:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.errors) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    );
  }
}
