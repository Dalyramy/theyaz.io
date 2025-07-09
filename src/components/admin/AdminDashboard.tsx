import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminGate } from '@/components/ui/PermissionGate';
import { RBACService } from '@/lib/rbac';
import { Role, Permission, UserRole, UserPermission, UserRoleType } from '@/lib/types';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, refreshUserPermissions } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        RBACService.getRoles(),
        RBACService.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = async (userId: string) => {
    setSelectedUser(userId);
    if (userId) {
      try {
        const [userRolesData, userPermissionsData] = await Promise.all([
          RBACService.getUserRoles(userId),
          RBACService.getUserPermissions(userId)
        ]);
        setUserRoles(userRolesData);
        setUserPermissions(userPermissionsData);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      }
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select both user and role');
      return;
    }

    setIsLoading(true);
    try {
      const success = await RBACService.assignRole(selectedUser, selectedRole, user?.id || '');
      if (success) {
        toast.success('Role assigned successfully');
        await handleUserChange(selectedUser);
        await refreshUserPermissions();
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setIsLoading(false);
    }
  };

  const removeRole = async (roleId: string) => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setIsLoading(true);
    try {
      const success = await RBACService.removeRole(selectedUser, roleId);
      if (success) {
        toast.success('Role removed successfully');
        await handleUserChange(selectedUser);
        await refreshUserPermissions();
      } else {
        toast.error('Failed to remove role');
      }
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGate>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="roles" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roles">Role Management</TabsTrigger>
                <TabsTrigger value="permissions">Permission Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <Select onValueChange={handleUserChange} value={selectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="role-select">Select Role</Label>
                    <Select onValueChange={setSelectedRole} value={selectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={assignRole} disabled={isLoading || !selectedUser || !selectedRole}>
                  {isLoading ? 'Assigning...' : 'Assign Role'}
                </Button>

                {selectedUser && userRoles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Current User Roles</h3>
                    <div className="space-y-2">
                      {userRoles.map((userRole) => (
                        <div key={userRole.id} className="flex items-center justify-between p-2 border rounded">
                          <Badge variant="secondary">{userRole.role?.name}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRole(userRole.role_id)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available Roles</h3>
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <div key={role.id} className="p-2 border rounded">
                          <Badge variant="outline">{role.name}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Available Permissions</h3>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="p-2 border rounded">
                          <Badge variant="outline">{permission.name}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {selectedUser && userPermissions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">User Permissions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {userPermissions.map((permission) => (
                        <Badge key={permission.id} variant="default">
                          {permission.permission_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminGate>
  );
};

export default AdminDashboard; 