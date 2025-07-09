import { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PERMISSIONS, RESOURCES, ACTIONS } from '@/lib/types';
import { RBACService } from '@/lib/rbac';
import { toast } from 'sonner';

const PermissionDebug = () => {
  const { user, hasPermission, canPerformAction, hasRole, refreshUserPermissions } = useAuth();
  const [testPermission, setTestPermission] = useState('');
  const [testResource, setTestResource] = useState('');
  const [testAction, setTestAction] = useState('');
  const [testRole, setTestRole] = useState('');
  const [debugResults, setDebugResults] = useState<any>(null);

  const runPermissionTest = async () => {
    if (!user?.id) {
      toast.error('No user logged in');
      return;
    }

    const results = {
      permission: testPermission,
      resource: testResource,
      action: testAction,
      role: testRole,
      clientSide: {
        hasPermission: hasPermission(testPermission),
        canPerformAction: canPerformAction(testResource, testAction),
        hasRole: hasRole(testRole as any),
      },
      serverSide: {
        hasPermission: await RBACService.hasPermission(user.id, testPermission),
        canPerformAction: await RBACService.canPerformAction(user.id, testResource, testAction),
        hasRole: await RBACService.hasRole(user.id, testRole as any),
      }
    };

    setDebugResults(results);
    toast.success('Permission test completed');
  };

  const refreshPermissions = async () => {
    await refreshUserPermissions();
    toast.success('Permissions refreshed');
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Debug</CardTitle>
          <CardDescription>Please log in to test permissions</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Permission Debug Tool</CardTitle>
          <CardDescription>
            Test and debug the RBAC system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Permission Test</TabsTrigger>
              <TabsTrigger value="current">Current State</TabsTrigger>
              <TabsTrigger value="debug">Debug Info</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permission-select">Test Permission</Label>
                  <Select onValueChange={setTestPermission} value={testPermission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PERMISSIONS).map(([category, permissions]) => (
                        <div key={category}>
                          <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                            {category}
                          </div>
                          {Object.entries(permissions).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {key}: {value}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role-select">Test Role</Label>
                  <Select onValueChange={setTestRole} value={testRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="moderator">moderator</SelectItem>
                      <SelectItem value="uploader">uploader</SelectItem>
                      <SelectItem value="viewer">viewer</SelectItem>
                      <SelectItem value="guest">guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resource-select">Test Resource</Label>
                  <Select onValueChange={setTestResource} value={testResource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(RESOURCES).map((resource) => (
                        <SelectItem key={resource} value={resource}>
                          {resource}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action-select">Test Action</Label>
                  <Select onValueChange={setTestAction} value={testAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ACTIONS).map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={runPermissionTest}>
                  Run Test
                </Button>
                <Button variant="outline" onClick={refreshPermissions}>
                  Refresh Permissions
                </Button>
              </div>

              {debugResults && (
                <div className="mt-4 p-4 border rounded">
                  <h3 className="font-semibold mb-2">Test Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Client Side</h4>
                      <div className="space-y-1">
                        <div>Permission: <Badge variant={debugResults.clientSide.hasPermission ? 'default' : 'outline'}>
                          {debugResults.clientSide.hasPermission ? 'Yes' : 'No'}
                        </Badge></div>
                        <div>Action: <Badge variant={debugResults.clientSide.canPerformAction ? 'default' : 'outline'}>
                          {debugResults.clientSide.canPerformAction ? 'Yes' : 'No'}
                        </Badge></div>
                        <div>Role: <Badge variant={debugResults.clientSide.hasRole ? 'default' : 'outline'}>
                          {debugResults.clientSide.hasRole ? 'Yes' : 'No'}
                        </Badge></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Server Side</h4>
                      <div className="space-y-1">
                        <div>Permission: <Badge variant={debugResults.serverSide.hasPermission ? 'default' : 'outline'}>
                          {debugResults.serverSide.hasPermission ? 'Yes' : 'No'}
                        </Badge></div>
                        <div>Action: <Badge variant={debugResults.serverSide.canPerformAction ? 'default' : 'outline'}>
                          {debugResults.serverSide.canPerformAction ? 'Yes' : 'No'}
                        </Badge></div>
                        <div>Role: <Badge variant={debugResults.serverSide.hasRole ? 'default' : 'outline'}>
                          {debugResults.serverSide.hasRole ? 'Yes' : 'No'}
                        </Badge></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Current User Info</h3>
                  <div className="space-y-2">
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Is Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Quick Permission Tests</h3>
                  <div className="space-y-2">
                    <div>Can upload photos: <Badge variant={hasPermission(PERMISSIONS.PHOTOS.CREATE) ? 'default' : 'outline'}>
                      {hasPermission(PERMISSIONS.PHOTOS.CREATE) ? 'Yes' : 'No'}
                    </Badge></div>
                    <div>Can delete photos: <Badge variant={hasPermission(PERMISSIONS.PHOTOS.DELETE) ? 'default' : 'outline'}>
                      {hasPermission(PERMISSIONS.PHOTOS.DELETE) ? 'Yes' : 'No'}
                    </Badge></div>
                    <div>Can moderate: <Badge variant={hasPermission(PERMISSIONS.COMMENTS.MODERATE) ? 'default' : 'outline'}>
                      {hasPermission(PERMISSIONS.COMMENTS.MODERATE) ? 'Yes' : 'No'}
                    </Badge></div>
                    <div>Is admin: <Badge variant={hasRole('admin') ? 'default' : 'outline'}>
                      {hasRole('admin') ? 'Yes' : 'No'}
                    </Badge></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="debug" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                <div className="space-y-2">
                  <p><strong>Auth Loading:</strong> {user.isLoading ? 'Yes' : 'No'}</p>
                  <p><strong>User Roles Count:</strong> {user.roles?.length || 0}</p>
                  <p><strong>User Permissions Count:</strong> {user.permissions?.length || 0}</p>
                  <p><strong>Session Valid:</strong> {user.session ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionDebug; 