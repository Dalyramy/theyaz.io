import { ReactNode } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { UserRoleType, PERMISSIONS } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGateProps {
  children: ReactNode;
  requiredRole?: UserRoleType;
  requiredPermission?: string;
  requiredResource?: string;
  requiredAction?: string;
  fallback?: ReactNode;
  showWhenUnauthorized?: boolean;
  loadingFallback?: ReactNode;
  multiplePermissions?: string[];
  multipleRoles?: UserRoleType[];
  requireAll?: boolean; // If true, requires ALL permissions/roles, otherwise ANY
}

const PermissionGate = ({
  children,
  requiredRole,
  requiredPermission,
  requiredResource,
  requiredAction,
  fallback = null,
  showWhenUnauthorized = false,
  loadingFallback = <Skeleton className="h-8 w-24" />,
  multiplePermissions = [],
  multipleRoles = [],
  requireAll = false
}: PermissionGateProps) => {
  const { user, hasPermission, canPerformAction, hasRole, isLoading } = useAuth();

  // Show loading fallback while auth is loading
  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  // If no user, show fallback or nothing
  if (!user) {
    return showWhenUnauthorized ? <>{children}</> : <>{fallback}</>;
  }

  let hasAccess = true;

  // Check multiple roles
  if (multipleRoles.length > 0) {
    const roleChecks = multipleRoles.map(role => hasRole(role));
    hasAccess = requireAll ? roleChecks.every(Boolean) : roleChecks.some(Boolean);
  }
  // Check single role
  else if (requiredRole && !hasRole(requiredRole)) {
    hasAccess = false;
  }

  // Check multiple permissions
  if (multiplePermissions.length > 0) {
    const permissionChecks = multiplePermissions.map(permission => hasPermission(permission));
    const permissionAccess = requireAll ? permissionChecks.every(Boolean) : permissionChecks.some(Boolean);
    hasAccess = hasAccess && permissionAccess;
  }
  // Check single permission
  else if (requiredPermission && !hasPermission(requiredPermission)) {
    hasAccess = false;
  }

  // Check resource-action based access
  if (requiredResource && requiredAction && !canPerformAction(requiredResource, requiredAction)) {
    hasAccess = false;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showWhenUnauthorized ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common permission checks
export const AdminGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredRole'>) => (
  <PermissionGate requiredRole="admin" {...props}>
    {children}
  </PermissionGate>
);

export const UploaderGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredRole'>) => (
  <PermissionGate requiredRole="uploader" {...props}>
    {children}
  </PermissionGate>
);

export const ModeratorGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredRole'>) => (
  <PermissionGate requiredRole="moderator" {...props}>
    {children}
  </PermissionGate>
);

export const ViewerGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredRole'>) => (
  <PermissionGate requiredRole="viewer" {...props}>
    {children}
  </PermissionGate>
);

export const PhotoUploadGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.PHOTOS.CREATE} {...props}>
    {children}
  </PermissionGate>
);

export const PhotoEditGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.PHOTOS.UPDATE} {...props}>
    {children}
  </PermissionGate>
);

export const PhotoDeleteGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.PHOTOS.DELETE} {...props}>
    {children}
  </PermissionGate>
);

export const AlbumCreateGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.ALBUMS.CREATE} {...props}>
    {children}
  </PermissionGate>
);

export const CommentCreateGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.COMMENTS.CREATE} {...props}>
    {children}
  </PermissionGate>
);

export const CommentModerateGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.COMMENTS.MODERATE} {...props}>
    {children}
  </PermissionGate>
);

export const UserManageGate = ({ children, ...props }: Omit<PermissionGateProps, 'requiredPermission'>) => (
  <PermissionGate requiredPermission={PERMISSIONS.USERS.MANAGE} {...props}>
    {children}
  </PermissionGate>
);

// Advanced gates for multiple permissions
export const ContentManagerGate = ({ children, ...props }: Omit<PermissionGateProps, 'multiplePermissions'>) => (
  <PermissionGate 
    multiplePermissions={[
      PERMISSIONS.PHOTOS.CREATE,
      PERMISSIONS.PHOTOS.UPDATE,
      PERMISSIONS.ALBUMS.CREATE
    ]}
    requireAll={false}
    {...props}
  >
    {children}
  </PermissionGate>
);

export const FullAdminGate = ({ children, ...props }: Omit<PermissionGateProps, 'multipleRoles'>) => (
  <PermissionGate 
    multipleRoles={['admin', 'moderator']}
    requireAll={false}
    {...props}
  >
    {children}
  </PermissionGate>
);

export default PermissionGate; 