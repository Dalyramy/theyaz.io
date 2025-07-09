import { ReactNode } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { UserRoleType, PERMISSIONS } from '@/lib/types';

interface PermissionGateProps {
  children: ReactNode;
  requiredRole?: UserRoleType;
  requiredPermission?: string;
  requiredResource?: string;
  requiredAction?: string;
  fallback?: ReactNode;
  showWhenUnauthorized?: boolean;
}

const PermissionGate = ({
  children,
  requiredRole,
  requiredPermission,
  requiredResource,
  requiredAction,
  fallback = null,
  showWhenUnauthorized = false
}: PermissionGateProps) => {
  const { user, hasPermission, canPerformAction, hasRole } = useAuth();

  // If no user, show fallback or nothing
  if (!user) {
    return showWhenUnauthorized ? <>{children}</> : <>{fallback}</>;
  }

  let hasAccess = true;

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    hasAccess = false;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
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

export default PermissionGate; 