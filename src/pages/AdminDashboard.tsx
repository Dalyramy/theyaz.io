import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { RBACService } from '@/lib/rbac';
import { Role, UserRole, UserRoleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import AdminRoute from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRoles {
  id: string;
  email?: string;
  full_name?: string;
  roles: UserRole[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, usersData] = await Promise.all([
        RBACService.getRoles(),
        loadUsersWithRoles()
      ]);
      
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersWithRoles = async (): Promise<UserWithRoles[]> => {
    // This would typically come from your Supabase client
    // For now, we'll create a mock implementation
    const { data: usersData, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error loading users:', error);
      return [];
    }

    const usersWithRoles = await Promise.all(
      usersData.users.map(async (user) => {
        const roles = await RBACService.getUserRoles(user.id);
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          roles
        };
      })
    );

    return usersWithRoles;
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select both user and role');
      return;
    }

    try {
      const success = await RBACService.assignRole(
        selectedUser, 
        selectedRole, 
        user?.id || ''
      );

      if (success) {
        toast.success('Role assigned successfully');
        await loadData();
        setSelectedUser('');
        setSelectedRole('');
      } else {
        toast.error('Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const removeRole = async (userId: string, roleId: string) => {
    try {
      const success = await RBACService.removeRole(userId, roleId);
      
      if (success) {
        toast.success('Role removed successfully');
        await loadData();
      } else {
        toast.error('Failed to remove role');
      }
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'destructive';
      case 'uploader': return 'default';
      case 'moderator': return 'secondary';
      case 'viewer': return 'outline';
      case 'guest': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Role Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assign Roles
              </CardTitle>
              <CardDescription>
                Assign roles to users to control their permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={assignRole} 
                disabled={!selectedUser || !selectedRole}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Statistics
              </CardTitle>
              <CardDescription>
                Overview of user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Users</span>
                  <Badge variant="outline">{users.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Roles</span>
                  <Badge variant="outline">{roles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Admins</span>
                  <Badge variant="destructive">
                    {users.filter(u => u.roles.some(r => r.role?.name === 'admin')).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Uploaders</span>
                  <Badge variant="default">
                    {users.filter(u => u.roles.some(r => r.role?.name === 'uploader')).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.full_name || user.email || user.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.roles.length > 0 ? (
                      user.roles.map((userRole) => (
                        <div key={userRole.role_id} className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeColor(userRole.role?.name || '')}>
                            {userRole.role?.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(user.id, userRole.role_id)}
                            className="h-6 w-6 p-0"
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard; 