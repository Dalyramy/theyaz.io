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
  CommentCreateGate,
  ContentManagerGate,
  FullAdminGate
} from '@/components/ui/PermissionGate';
import { 
  AdminOnly, 
  UploaderOnly, 
  ModeratorOnly, 
  ViewerOnly,
  PhotoUploadOnly,
  RoleBasedContent,
  ProtectedContent
} from '@/components/protection/ContentProtection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          <CardTitle>Enhanced RBAC System Test</CardTitle>
          <CardDescription>
            Testing the advanced Role-Based Access Control system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Tests</TabsTrigger>
              <TabsTrigger value="gates">Permission Gates</TabsTrigger>
              <TabsTrigger value="protection">Content Protection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="gates" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Permission Gate Tests</h3>
              
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

                <div>
                  <h4 className="font-medium">Content Manager Gate (Multiple Permissions):</h4>
                  <ContentManagerGate>
                    <Button variant="outline">Content Management (Visible)</Button>
                  </ContentManagerGate>
                  <span className="text-sm text-muted-foreground ml-2">
                    (Should show if user has ANY of: photos.create, photos.update, albums.create)
                  </span>
                </div>

                <div>
                  <h4 className="font-medium">Full Admin Gate (Multiple Roles):</h4>
                  <FullAdminGate>
                    <Button variant="outline">Admin/Moderator Action (Visible)</Button>
                  </FullAdminGate>
                  <span className="text-sm text-muted-foreground ml-2">
                    (Should show if user has admin OR moderator role)
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="protection" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Content Protection Tests</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium">Admin Only Content:</h4>
                  <AdminOnly>
                    <Card>
                      <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>This content is only visible to admins</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Welcome to the admin dashboard!</p>
                      </CardContent>
                    </Card>
                  </AdminOnly>
                </div>

                <div>
                  <h4 className="font-medium">Uploader Only Content:</h4>
                  <UploaderOnly>
                    <Card>
                      <CardHeader>
                        <CardTitle>Uploader Tools</CardTitle>
                        <CardDescription>This content is only visible to uploaders</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Upload and manage your photos here!</p>
                      </CardContent>
                    </Card>
                  </UploaderOnly>
                </div>

                <div>
                  <h4 className="font-medium">Moderator Only Content:</h4>
                  <ModeratorOnly>
                    <Card>
                      <CardHeader>
                        <CardTitle>Moderation Panel</CardTitle>
                        <CardDescription>This content is only visible to moderators</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Review and moderate content here!</p>
                      </CardContent>
                    </Card>
                  </ModeratorOnly>
                </div>

                <div>
                  <h4 className="font-medium">Photo Upload Permission Only:</h4>
                  <PhotoUploadOnly>
                    <Card>
                      <CardHeader>
                        <CardTitle>Photo Upload</CardTitle>
                        <CardDescription>This content is only visible to users with photo upload permission</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Upload your photos here!</p>
                      </CardContent>
                    </Card>
                  </PhotoUploadOnly>
                </div>

                <div>
                  <h4 className="font-medium">Role-Based Content with Different Views:</h4>
                  <RoleBasedContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Dynamic Content</CardTitle>
                        <CardDescription>This content adapts based on your role</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>You're seeing this content based on your current role!</p>
                      </CardContent>
                    </Card>
                  </RoleBasedContent>
                </div>

                <div>
                  <h4 className="font-medium">Protected Content with Custom Fallback:</h4>
                  <ProtectedContent 
                    requiredRole="admin"
                    fallback={
                      <Card>
                        <CardHeader>
                          <CardTitle>Access Denied</CardTitle>
                          <CardDescription>This is a custom fallback message</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>You don't have access to this content.</p>
                        </CardContent>
                      </Card>
                    }
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Secret Admin Content</CardTitle>
                        <CardDescription>This is only visible to admins</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Welcome to the secret admin area!</p>
                      </CardContent>
                    </Card>
                  </ProtectedContent>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Advanced RBAC Features</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Multiple Permission Gates:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Require ALL permissions:</h5>
                      <ContentManagerGate requireAll={true}>
                        <Button variant="outline" className="w-full">All Permissions Required</Button>
                      </ContentManagerGate>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Require ANY permission:</h5>
                      <ContentManagerGate requireAll={false}>
                        <Button variant="outline" className="w-full">Any Permission Required</Button>
                      </ContentManagerGate>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Loading States:</h4>
                  <p className="text-sm text-muted-foreground">
                    Permission gates now show loading states while auth is being determined.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Debug Tools:</h4>
                  <div className="space-y-2">
                    <Button asChild variant="outline">
                      <a href="/permission-debug">Permission Debug Tool</a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="/admin-dashboard">Admin Dashboard</a>
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Navigation Integration:</h4>
                  <p className="text-sm text-muted-foreground">
                    The RoleBasedNav component provides role-based navigation menus.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACTest; 