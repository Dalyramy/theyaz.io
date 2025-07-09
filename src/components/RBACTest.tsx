import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PERMISSIONS } from '@/lib/types';
import { 
  PhotoUploadGate, 
  AdminGate, 
  ModeratorGate, 
  UploaderGate,
  CommentCreateGate 
} from '@/components/ui/PermissionGate';

const RBACTest = () => {
  const { user, hasPermission, canPerformAction, hasRole, isAdmin } = useAuth();

  const testPermissions = [
    PERMISSIONS.PHOTOS.CREATE,
    PERMISSIONS.PHOTOS.READ,
    PERMISSIONS.PHOTOS.UPDATE,
    PERMISSIONS.PHOTOS.DELETE,
    PERMISSIONS.ALBUMS.CREATE,
    PERMISSIONS.COMMENTS.CREATE,
    PERMISSIONS.SYSTEM.ADMIN,
  ];

  const testRoles = ['admin', 'uploader', 'moderator', 'viewer', 'guest'];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>RBAC System Test</CardTitle>
          <CardDescription>
            Testing the Role-Based Access Control system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">User Information</h3>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Role Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Role Tests</h3>
            <div className="flex flex-wrap gap-2">
              {testRoles.map((role) => (
                <Badge 
                  key={role} 
                  variant={hasRole(role) ? 'default' : 'outline'}
                >
                  {role}: {hasRole(role) ? 'Yes' : 'No'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Permission Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Permission Tests</h3>
            <div className="grid grid-cols-2 gap-2">
              {testPermissions.map((permission) => (
                <Badge 
                  key={permission} 
                  variant={hasPermission(permission) ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {permission}: {hasPermission(permission) ? 'Yes' : 'No'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Action Tests</h3>
            <div className="space-y-2">
              <p>
                Can create photos: {canPerformAction('photos', 'create') ? 'Yes' : 'No'}
              </p>
              <p>
                Can read photos: {canPerformAction('photos', 'read') ? 'Yes' : 'No'}
              </p>
              <p>
                Can delete photos: {canPerformAction('photos', 'delete') ? 'Yes' : 'No'}
              </p>
              <p>
                Can manage users: {canPerformAction('users', 'manage') ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* UI Component Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">UI Component Tests</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Photo Upload Gate:</h4>
                <PhotoUploadGate>
                  <Button>Upload Photo (Visible)</Button>
                </PhotoUploadGate>
                <span className="text-sm text-muted-foreground ml-2">
                  (Should only show if user has photos.create permission)
                </span>
              </div>

              <div>
                <h4 className="font-medium">Admin Gate:</h4>
                <AdminGate>
                  <Button variant="destructive">Admin Action (Visible)</Button>
                </AdminGate>
                <span className="text-sm text-muted-foreground ml-2">
                  (Should only show if user has admin role)
                </span>
              </div>

              <div>
                <h4 className="font-medium">Moderator Gate:</h4>
                <ModeratorGate>
                  <Button variant="secondary">Moderate Content (Visible)</Button>
                </ModeratorGate>
                <span className="text-sm text-muted-foreground ml-2">
                  (Should only show if user has moderator role)
                </span>
              </div>

              <div>
                <h4 className="font-medium">Uploader Gate:</h4>
                <UploaderGate>
                  <Button variant="outline">Manage Content (Visible)</Button>
                </UploaderGate>
                <span className="text-sm text-muted-foreground ml-2">
                  (Should only show if user has uploader role)
                </span>
              </div>

              <div>
                <h4 className="font-medium">Comment Create Gate:</h4>
                <CommentCreateGate>
                  <Button variant="outline">Add Comment (Visible)</Button>
                </CommentCreateGate>
                <span className="text-sm text-muted-foreground ml-2">
                  (Should only show if user has comments.create permission)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACTest; 