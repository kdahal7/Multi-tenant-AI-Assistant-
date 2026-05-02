import { ISession, UserRole } from '@/types';
import { connectDB } from '@/lib/db';
import { User, Project } from '@/db/models';

/**
 * Access layer - pure rules for authorization
 * Tests authorization rules before any data access
 */

export interface AccessContext {
  userId: string;
  userRole: UserRole;
  projectId: string;
  projectSlug?: string;
}

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

/**
 * Check if user can access a project
 */
export async function canUserAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  await connectDB();
  
  const user = await User.findOne({
    _id: userId,
    projectId: projectId,
  });

  return !!user;
}

/**
 * Check if user is admin of a project
 */
export async function isProjectAdmin(
  userId: string,
  projectId: string
): Promise<boolean> {
  await connectDB();

  const user = await User.findOne({
    _id: userId,
    projectId: projectId,
    role: 'admin',
  });

  return !!user;
}

/**
 * Enforce user can access project
 */
export async function requireProjectAccess(
  userId: string,
  projectId: string
): Promise<void> {
  const hasAccess = await canUserAccessProject(userId, projectId);
  if (!hasAccess) {
    throw new AccessDeniedError('Access denied to this project');
  }
}

/**
 * Enforce user is project admin
 */
export async function requireProjectAdmin(
  userId: string,
  projectId: string
): Promise<void> {
  const isAdmin = await isProjectAdmin(userId, projectId);
  if (!isAdmin) {
    throw new AccessDeniedError('Only admins can access this resource');
  }
}

/**
 * Get user context from session
 */
export async function getUserContext(
  session: ISession,
  projectSlug?: string
): Promise<AccessContext> {
  if (!session.user) {
    throw new AccessDeniedError('No user session');
  }

  await connectDB();

  // If projectSlug provided, validate it matches user's project
  if (projectSlug) {
    const project = await Project.findOne({ slug: projectSlug });
    if (!project) {
      throw new AccessDeniedError('Project not found');
    }

    const userHasAccess = await canUserAccessProject(
      session.user.id,
      project._id.toString()
    );

    if (!userHasAccess) {
      throw new AccessDeniedError('Access denied to this project');
    }

    return {
      userId: session.user.id,
      userRole: session.user.role,
      projectId: project._id.toString(),
      projectSlug,
    };
  }

  // Use user's project from session
  return {
    userId: session.user.id,
    userRole: session.user.role,
    projectId: session.user.projectId,
    projectSlug,
  };
}
