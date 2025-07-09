import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { UserRoleType, PERMISSIONS } from '@/lib/types';

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: UserRoleType;
  requiredPermission?: string;
  requiredResource?: string;
  requiredAction?: string;
  fallbackPath?: string;
  showLoading?: boolean;
};

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requiredPermission,
  requiredResource,
  requiredAction,
  fallbackPath = "/login",
  showLoading = true
}: ProtectedRouteProps) => {
  const { user, isLoading, hasPermission, canPerformAction, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check resource-action based access
  if (requiredResource && requiredAction && !canPerformAction(requiredResource, requiredAction)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
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

export default ProtectedRoute;
