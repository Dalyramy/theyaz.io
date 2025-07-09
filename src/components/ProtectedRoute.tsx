import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { UserRoleType, PERMISSIONS } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Shield } from 'lucide-react';

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: UserRoleType;
  requiredPermission?: string;
  requiredResource?: string;
  requiredAction?: string;
  multiplePermissions?: string[];
  multipleRoles?: UserRoleType[];
  requireAll?: boolean;
  fallbackPath?: string;
  showLoading?: boolean;
  customFallback?: ReactNode;
};

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requiredPermission,
  requiredResource,
  requiredAction,
  multiplePermissions = [],
  multipleRoles = [],
  requireAll = false,
  fallbackPath = "/login",
  showLoading = true,
  customFallback
}: ProtectedRouteProps) => {
  const { user, isLoading, hasPermission, canPerformAction, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    if (customFallback) {
      return <>{customFallback}</>;
    }
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
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

  // Show unauthorized fallback
  if (customFallback) {
    return <>{customFallback}</>;
  }

  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
};

// Convenience components for common permission checks
export const AdminRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const UploaderRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="uploader" {...props}>
    {children}
  </ProtectedRoute>
);

export const ModeratorRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="moderator" {...props}>
    {children}
  </ProtectedRoute>
);

export const ViewerRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="viewer" {...props}>
    {children}
  </ProtectedRoute>
);

export const PhotoUploadRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.PHOTOS.CREATE} {...props}>
    {children}
  </ProtectedRoute>
);

export const PhotoEditRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.PHOTOS.UPDATE} {...props}>
    {children}
  </ProtectedRoute>
);

export const PhotoDeleteRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.PHOTOS.DELETE} {...props}>
    {children}
  </ProtectedRoute>
);

export const AlbumCreateRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.ALBUMS.CREATE} {...props}>
    {children}
  </ProtectedRoute>
);

export const UserManageRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredPermission'>) => (
  <ProtectedRoute requiredPermission={PERMISSIONS.USERS.MANAGE} {...props}>
    {children}
  </ProtectedRoute>
);

// Advanced route protection with multiple permissions
export const ContentManagerRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'multiplePermissions'>) => (
  <ProtectedRoute 
    multiplePermissions={[
      PERMISSIONS.PHOTOS.CREATE,
      PERMISSIONS.PHOTOS.UPDATE,
      PERMISSIONS.ALBUMS.CREATE
    ]}
    requireAll={false}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export const FullAdminRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'multipleRoles'>) => (
  <ProtectedRoute 
    multipleRoles={['admin', 'moderator']}
    requireAll={false}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
