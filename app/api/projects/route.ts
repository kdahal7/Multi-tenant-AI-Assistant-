import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/session';
import { ProjectService } from '@/services';
import { accessControl } from '@/lib/middleware';

/**
 * GET /api/projects?slug=demo - Get project by slug
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing project slug' }, { status: 400 });
    }

    const project = await ProjectService.getProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await accessControl.requireProjectAccess(session.user.id, project._id.toString());

    return NextResponse.json({
      _id: project._id,
      name: project.name,
      slug: project.slug,
      description: project.description,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);

    if (error.name === 'AccessDeniedError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
