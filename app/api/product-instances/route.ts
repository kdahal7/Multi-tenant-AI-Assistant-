import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';
import { ProductInstanceService, ProjectService } from '@/services';
import { accessControl } from '@/lib/middleware';

/**
 * GET /api/product-instances - Get all product instances for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    const projectSlug = searchParams.get('projectSlug');

    if (!projectIdParam && !projectSlug) {
      return NextResponse.json(
        { error: 'Missing projectId or projectSlug' },
        { status: 400 }
      );
    }

    let projectId = projectIdParam || '';

    if (projectSlug) {
      const project = await ProjectService.getProjectBySlug(projectSlug);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      projectId = project._id.toString();
    }

    // Check access
    await accessControl.requireProjectAccess(session.user.id, projectId);

    // Get product instances
    const instances = await ProductInstanceService.getProductInstances(projectId);

    return NextResponse.json(
      instances.map((instance) => ({
        _id: instance._id,
        name: instance.name,
        productType: instance.productType,
        namespace: instance.namespace,
      }))
    );
  } catch (error: any) {
    console.error('Error fetching product instances:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch product instances' },
      { status: 500 }
    );
  }
}
