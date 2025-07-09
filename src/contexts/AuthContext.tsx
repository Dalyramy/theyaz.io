import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode,
  useCallback 
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { RBACService } from '@/lib/rbac';
import { 
  ExtendedUser, 
  AuthContextType, 
  UserRole, 
  UserPermission, 
  UserRoleType,
  PERMISSIONS 
} from '@/lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export { useAuth } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const navigate = useNavigate();

  // Fetch user roles and permissions
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [roles, permissions] = await Promise.all([
        RBACService.getUserRoles(userId),
        RBACService.getUserPermissions(userId)
      ]);
      
      setUserRoles(roles);
      setUserPermissions(permissions);
      
      // Check if user is admin
      const adminRole = roles.find(role => role.role?.name === 'admin');
      setIsAdmin(!!adminRole);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserRoles([]);
      setUserPermissions([]);
      setIsAdmin(false);
    }
  }, []);

  // Permission checking functions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !userPermissions.length) return false;
    return userPermissions.some(p => p.permission_name === permission);
  }, [user, userPermissions]);

  const canPerformAction = useCallback((resource: string, action: string): boolean => {
    if (!user || !userPermissions.length) return false;
    return userPermissions.some(p => p.resource === resource && p.action === action);
  }, [user, userPermissions]);

  const hasRole = useCallback((role: UserRoleType): boolean => {
    if (!user || !userRoles.length) return false;
    return userRoles.some(userRole => userRole.role?.name === role);
  }, [user, userRoles]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          const extendedUser: ExtendedUser = {
            ...newSession.user,
            roles: [],
            permissions: []
          };
          setUser(extendedUser);
          await fetchUserData(newSession.user.id);
        } else {
          setUser(null);
          setUserRoles([]);
          setUserPermissions([]);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const extendedUser: ExtendedUser = {
          ...currentSession.user,
          roles: [],
          permissions: []
        };
        setUser(extendedUser);
        await fetchUserData(currentSession.user.id);
      } else {
        setUser(null);
        setUserRoles([]);
        setUserPermissions([]);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string, username?: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Update user with roles and permissions
  const updateUserWithRBAC = useCallback((updatedUser: ExtendedUser) => {
    setUser(updatedUser);
  }, []);

  // Refresh user permissions (useful after role changes)
  const refreshUserPermissions = useCallback(async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  }, [user?.id, fetchUserData]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoading, 
        isAdmin,
        hasPermission,
        canPerformAction,
        hasRole,
        signUp, 
        signIn, 
        signInWithGoogle, 
        signInWithApple,
        signInWithFacebook,
        signOut,
        refreshUserPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
