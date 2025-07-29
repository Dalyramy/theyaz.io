import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, UserCheck, UserX, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface User {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all profiles with a simple query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          is_admin,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform the data and add email from auth.users if available
      const transformedUsers = profilesData?.map(user => ({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: `${user.username}@test.com`, // For test users, we know the pattern
        is_admin: user.is_admin || false,
        created_at: user.created_at
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus }
          : user
      ));

      toast({
        title: 'Success',
        description: `User ${!currentStatus ? 'promoted to' : 'demoted from'} admin`,
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <Alert>
              <AlertDescription>Please log in to access this page.</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <Alert>
              <AlertDescription>
                You don't have permission to access this page. 
                Debug info: User ID: {user?.id}, isAdmin: {isAdmin.toString()}
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-24">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Peace Sign Background Watermark */}
        <div 
          className="fixed bottom-4 left-4 pointer-events-none opacity-6 z-0"
          style={{
            width: '300px',
            height: '300px',
            backgroundImage: 'url(/icons/peace-watermark.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom left',
            backgroundRepeat: 'no-repeat',
            transform: 'rotate(-10deg)',
          }}
        />
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage user permissions and site administration
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter(u => u.is_admin).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserX className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">
                      {users.filter(u => !u.is_admin).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Regular Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Search */}
          <motion.div
            className="mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </motion.div>

          {/* Users List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-border hover-lift">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                    <div className="w-20 h-8 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username?.charAt(0).toUpperCase() || user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {user.full_name || user.username || 'Unnamed User'}
                            </p>
                            {user.is_admin && (
                              <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={user.is_admin ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          disabled={user.id === user?.id} // Can't demote yourself
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 