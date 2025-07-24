import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isConnected } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Database connection failed. Please try again later.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        username: username,
        full_name: fullName
      });
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/login');
      }
    } catch (error: unknown) {
      let message = 'An unexpected error occurred';
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message;
      }
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add social sign up handlers (dummy for now)
  const handleGoogleSignUp = async () => { 
    if (!isConnected) {
      toast.error('Database connection failed. Please try again later.');
      return;
    }
    toast.info('Google sign up not implemented'); 
  };
  const handleAppleSignUp = async () => { 
    if (!isConnected) {
      toast.error('Database connection failed. Please try again later.');
      return;
    }
    toast.info('Apple sign up not implemented'); 
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-full px-2 sm:px-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
        <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-border bg-card text-foreground overflow-hidden backdrop-blur-md p-4 sm:p-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-5xl sm:text-7xl font-extrabold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 py-4">Create an account</CardTitle>
            <p className="text-center text-base sm:text-lg text-muted-foreground">
            Enter your information to create an account
            </p>
            
            {/* Database connection status */}
            {!isConnected && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Database connection issue detected</span>
              </div>
            )}
        </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={!isConnected}
                className="w-full bg-muted/50 hover:bg-muted border border-border text-foreground font-semibold shadow-none transition backdrop-blur-sm disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleAppleSignUp}
                disabled={!isConnected}
                className="w-full bg-muted/50 hover:bg-muted border border-border text-foreground font-semibold shadow-none transition backdrop-blur-sm disabled:opacity-50"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Apple
              </Button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground tracking-wider font-medium bg-background">
                  or continue with
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isConnected}
                    className="bg-muted/50 border border-border text-foreground rounded-xl disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="username" className="text-base">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isConnected}
                    className="bg-muted/50 border border-border text-foreground rounded-xl disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!isConnected}
                  className="bg-muted/50 border border-border text-foreground rounded-xl disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!isConnected}
                  className="bg-muted/50 border border-border text-foreground rounded-xl disabled:opacity-50"
              />
            </div>
              <Button
                type="submit"
                className="w-full bg-primary text-white rounded-2xl py-3 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
                disabled={isLoading || !isConnected}
              >
                <Camera className="w-5 h-5" />
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="underline underline-offset-4 text-primary hover:text-primary/80 transition"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
