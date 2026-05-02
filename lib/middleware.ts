import { AccessDeniedError, canUserAccessProject, isProjectAdmin, requireProjectAccess, requireProjectAdmin } from '@/lib/access';

/**
 * Access control middleware for API routes
 */
export const accessControl = {
  AccessDeniedError,
  canUserAccessProject,
  isProjectAdmin,
  requireProjectAccess,
  requireProjectAdmin,
};
