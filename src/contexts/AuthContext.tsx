import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, testConnection } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isConnected: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string, username?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export { useAuth } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Test database connection first
    const testDbConnection = async () => {
      const connected = await testConnection();
      setIsConnected(connected);
      if (!connected) {
        console.error('Database connection failed. Check your Supabase configuration.');
      }
    };

    testDbConnection();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change:', event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        if (newSession?.user) {
          await fetchIsAdmin(newSession.user.id);
          await createUserProfile(newSession.user);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      
      if (currentSession?.user) {
        await fetchIsAdmin(currentSession.user.id);
        await createUserProfile(currentSession.user);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0],
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const fetchIsAdmin = async (userId: string) => {
    try {
      console.log('Fetching admin status for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      console.log('Admin fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      const isAdminUser = !!(data && (data as any).is_admin);
      console.log('Setting isAdmin to:', isAdminUser);
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Exception in fetchIsAdmin:', error);
      setIsAdmin(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string, username?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (data.user && !error) {
        // Create profile immediately after successful signup
        await createUserProfile(data.user);
      }
      
      return { error };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 500 
        } as AuthError 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          status: 500 
        } as AuthError 
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Google signin error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Google signin error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Apple signin error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Apple signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isLoading, 
        isAdmin,
        isConnected,
        signUp, 
        signIn, 
        signInWithGoogle, 
        signInWithApple,
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
