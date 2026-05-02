import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';
import { updateIntegrationSchema } from '@/lib/validation';
import { IntegrationService } from '@/services';
import { accessControl } from '@/lib/middleware';

/**
 * GET /api/integrations - Get integrations for a product instance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const productInstanceId = searchParams.get('productInstanceId');

    if (!projectId || !productInstanceId) {
      return NextResponse.json(
        { error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    // Check access
    await accessControl.requireProjectAccess(session.user.id, projectId);

    // Get integrations
    const integrations = await IntegrationService.getIntegrations(
      projectId,
      productInstanceId
    );

    return NextResponse.json(integrations);
  } catch (error: any) {
    console.error('Error fetching integrations:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/integrations/:id - Update integration
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing integration ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateIntegrationSchema.parse(body);

    // Get integration to verify access
    const integration = await IntegrationService.getIntegration(id);

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Check access
    await accessControl.requireProjectAccess(
      session.user.id,
      integration.projectId.toString()
    );

    // Update integration
    const updated = await IntegrationService.updateIntegration(id, data);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating integration:', error);

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
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}
