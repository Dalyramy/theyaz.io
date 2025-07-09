import { ReactNode } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Shield, Eye, Upload, Settings } from 'lucide-react';
import { 
  AdminGate, 
  UploaderGate, 
  ModeratorGate, 
  ViewerGate,
  PhotoUploadGate 
} from '@/components/ui/PermissionGate';

interface ContentProtectionProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  title?: string;
  description?: string;
}

const ContentProtection = ({
  children,
  requiredRole,
  requiredPermission,
  fallback,
  showUpgradePrompt = true,
  title = "Access Restricted",
  description = "You don't have permission to view this content."
}: ContentProtectionProps) => {
  const { user, hasRole, hasPermission } = useAuth();

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Please log in to access this content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/login">Log In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole as any)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Required role: <strong>{requiredRole}</strong></p>
              <p>Your current roles:</p>
              <div className="mt-2 space-y-1">
                {['admin', 'moderator', 'uploader', 'viewer'].map(role => (
                  <div key={role} className="flex items-center gap-2">
                    <span className="w-4 h-4">
                      {hasRole(role as any) ? '✓' : '✗'}
                    </span>
                    <span className={hasRole(role as any) ? 'text-green-600' : 'text-muted-foreground'}>
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Button asChild className="w-full">
              <a href="/contact">Request Access</a>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  // Check if user has required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Required permission: <strong>{requiredPermission}</strong></p>
            </div>
            <Button asChild className="w-full">
              <a href="/contact">Request Permission</a>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Convenience components for common protection scenarios
export const AdminOnly = ({ children, ...props }: Omit<ContentProtectionProps, 'requiredRole'>) => (
  <ContentProtection requiredRole="admin" {...props}>
    {children}
  </ContentProtection>
);

export const UploaderOnly = ({ children, ...props }: Omit<ContentProtectionProps, 'requiredRole'>) => (
  <ContentProtection requiredRole="uploader" {...props}>
    {children}
  </ContentProtection>
);

export const ModeratorOnly = ({ children, ...props }: Omit<ContentProtectionProps, 'requiredRole'>) => (
  <ContentProtection requiredRole="moderator" {...props}>
    {children}
  </ContentProtection>
);

export const ViewerOnly = ({ children, ...props }: Omit<ContentProtectionProps, 'requiredRole'>) => (
  <ContentProtection requiredRole="viewer" {...props}>
    {children}
  </ContentProtection>
);

export const PhotoUploadOnly = ({ children, ...props }: Omit<ContentProtectionProps, 'requiredPermission'>) => (
  <ContentProtection requiredPermission="photos.create" {...props}>
    {children}
  </ContentProtection>
);

// Advanced protection with custom fallbacks
export const ProtectedContent = ({ 
  children, 
  fallback,
  showUpgradePrompt = false,
  ...props 
}: ContentProtectionProps) => (
  <ContentProtection 
    fallback={fallback}
    showUpgradePrompt={showUpgradePrompt}
    {...props}
  >
    {children}
  </ContentProtection>
);

// Role-based content with different fallbacks
export const RoleBasedContent = ({ children }: { children: ReactNode }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Please Log In
          </CardTitle>
          <CardDescription>
            Create an account to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/login">Get Started</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasRole('admin')) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <Settings className="h-5 w-5" />
          <span className="font-semibold">Admin View</span>
        </div>
        {children}
      </div>
    );
  }

  if (hasRole('moderator')) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Shield className="h-5 w-5" />
          <span className="font-semibold">Moderator View</span>
        </div>
        {children}
      </div>
    );
  }

  if (hasRole('uploader')) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-orange-600">
          <Upload className="h-5 w-5" />
          <span className="font-semibold">Uploader View</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <Eye className="h-5 w-5" />
        <span className="font-semibold">Viewer Mode</span>
      </div>
      {children}
    </div>
  );
};

export default ContentProtection; 