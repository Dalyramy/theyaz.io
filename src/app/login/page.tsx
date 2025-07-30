'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PeaceWatermark from '@/components/ui/PeaceWatermark';
import { AuthService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await AuthService.signIn({ email, password });
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      // Redirect to home page on successful login
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      {/* Peace Sign Background Watermark */}
      <PeaceWatermark />
      
      <main className="container mx-auto py-6 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden hover-lift rounded-2xl border-border">
            <CardHeader className="text-center pb-6">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('auth.welcome', 'Welcome Back')}
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
                {t('auth.login', 'Sign In')}
              </CardTitle>
              <CardDescription>
                {t('auth.login_desc', 'Enter your credentials to access your account')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('auth.email', 'Email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.email_placeholder', 'Enter your email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t('auth.password', 'Password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.password_placeholder', 'Enter your password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-muted-foreground">
                      {t('auth.remember', 'Remember me')}
                    </span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-primary hover:underline"
                  >
                    {t('auth.forgot_password', 'Forgot password?')}
                  </Link>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('auth.signing_in', 'Signing in...')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {t('auth.sign_in', 'Sign In')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
              
              <Separator className="my-6" />
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('auth.no_account', "Don't have an account?")}
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    {t('auth.create_account', 'Create Account')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 