/**
 * Role-Based Access Control utilities
 */

export type Role = 'super_admin' | 'editor' | 'uploader' | 'reader';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

/**
 * Role hierarchy (higher roles inherit lower role permissions)
 */
const roleHierarchy: Record<Role, number> = {
  reader: 1,
  uploader: 2,
  editor: 3,
  super_admin: 4,
};

/**
 * Permission matrix defining what each role can do
 */
const permissions: Record<Role, Permission[]> = {
  reader: [
    { resource: 'sermons', action: 'read' },
    { resource: 'speakers', action: 'read' },
    { resource: 'devotionals', action: 'read' },
    { resource: 'quarterlies', action: 'read' },
    { resource: 'media', action: 'read' },
  ],
  uploader: [
    { resource: 'sermons', action: 'read' },
    { resource: 'speakers', action: 'read' },
    { resource: 'devotionals', action: 'read' },
    { resource: 'quarterlies', action: 'read' },
    { resource: 'media', action: 'create' },
    { resource: 'media', action: 'read' },
    { resource: 'media', action: 'update' },
  ],
  editor: [
    { resource: 'sermons', action: 'create' },
    { resource: 'sermons', action: 'read' },
    { resource: 'sermons', action: 'update' },
    { resource: 'speakers', action: 'create' },
    { resource: 'speakers', action: 'read' },
    { resource: 'speakers', action: 'update' },
    { resource: 'devotionals', action: 'create' },
    { resource: 'devotionals', action: 'read' },
    { resource: 'devotionals', action: 'update' },
    { resource: 'quarterlies', action: 'create' },
    { resource: 'quarterlies', action: 'read' },
    { resource: 'quarterlies', action: 'update' },
    { resource: 'media', action: 'create' },
    { resource: 'media', action: 'read' },
    { resource: 'media', action: 'update' },
  ],
  super_admin: [
    { resource: 'sermons', action: 'create' },
    { resource: 'sermons', action: 'read' },
    { resource: 'sermons', action: 'update' },
    { resource: 'sermons', action: 'delete' },
    { resource: 'speakers', action: 'create' },
    { resource: 'speakers', action: 'read' },
    { resource: 'speakers', action: 'update' },
    { resource: 'speakers', action: 'delete' },
    { resource: 'devotionals', action: 'create' },
    { resource: 'devotionals', action: 'read' },
    { resource: 'devotionals', action: 'update' },
    { resource: 'devotionals', action: 'delete' },
    { resource: 'quarterlies', action: 'create' },
    { resource: 'quarterlies', action: 'read' },
    { resource: 'quarterlies', action: 'update' },
    { resource: 'quarterlies', action: 'delete' },
    { resource: 'media', action: 'create' },
    { resource: 'media', action: 'read' },
    { resource: 'media', action: 'update' },
    { resource: 'media', action: 'delete' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'audit', action: 'read' },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const rolePerms = permissions[role] || [];
  return rolePerms.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Check if role A is higher than role B in hierarchy
 */
export function isHigherRole(roleA: Role, roleB: Role): boolean {
  return roleHierarchy[roleA] > roleHierarchy[roleB];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return permissions[role] || [];
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(role: Role, path: string): boolean {
  // Super admin can access everything
  if (role === 'super_admin') return true;

  // Map routes to required permissions
  const routePermissions: Record<string, { resource: string; action: 'read' | 'create' | 'update' | 'delete' }> = {
    '/dashboard/sermons': { resource: 'sermons', action: 'read' },
    '/dashboard/sermons/new': { resource: 'sermons', action: 'create' },
    '/dashboard/sermons/edit': { resource: 'sermons', action: 'update' },
    '/dashboard/speakers': { resource: 'speakers', action: 'read' },
    '/dashboard/speakers/new': { resource: 'speakers', action: 'create' },
    '/dashboard/speakers/edit': { resource: 'speakers', action: 'update' },
    '/dashboard/devotionals': { resource: 'devotionals', action: 'read' },
    '/dashboard/devotionals/new': { resource: 'devotionals', action: 'create' },
    '/dashboard/devotionals/edit': { resource: 'devotionals', action: 'update' },
    '/dashboard/quarterlies': { resource: 'quarterlies', action: 'read' },
    '/dashboard/quarterlies/new': { resource: 'quarterlies', action: 'create' },
    '/dashboard/quarterlies/edit': { resource: 'quarterlies', action: 'update' },
    '/dashboard/media': { resource: 'media', action: 'read' },
    '/dashboard/users': { resource: 'users', action: 'read' },
    '/dashboard/audit': { resource: 'audit', action: 'read' },
  };

  // Find matching route
  const matchedRoute = Object.keys(routePermissions).find((route) =>
    path.startsWith(route)
  );

  if (!matchedRoute) {
    // Allow access to dashboard home for all authenticated users
    return path === '/dashboard' || path === '/dashboard/';
  }

  const required = routePermissions[matchedRoute];
  return hasPermission(role, required.resource, required.action);
}
