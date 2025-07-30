"use client"

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import GradientText from '@/components/ui/GradientText';
import { SimpleLanguageSelector } from '@/components/ui/SimpleLanguageSelector';
import { Button } from '@/components/ui/button';
import { SimpleThemeToggle } from '@/components/ui/SimpleThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Upload } from 'lucide-react';

const Navbar = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 w-full h-20 z-50 border-b border-gray-200 dark:border-border/40 bg-white/60 dark:bg-background/60 backdrop-blur-xl shadow-lg">
      <div className="container flex items-center justify-between px-4 sm:px-8 py-2 sm:py-3 gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-5 transition-all hover:scale-105"
        >
          <Logo style={{ width: 40, height: 40 }} />
          <GradientText 
            variant="brand" 
            className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center brand-font"
          >
            theyaz.io
          </GradientText>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold hover:text-accent">
            {t('nav.home')}
          </Link>
          <Link href="/gallery" className="text-lg font-semibold hover:text-accent">
            {t('nav.gallery')}
          </Link>
          <Link href="/about" className="text-lg font-semibold hover:text-accent">
            {t('nav.about')}
          </Link>
          <Link href="/trans" className="text-lg font-semibold hover:text-accent">
            {t('nav.trans')}
          </Link>
                           <SimpleLanguageSelector />
                 <SimpleThemeToggle />
                 <div className="flex items-center gap-2 ml-4">
                   {user ? (
                     <div className="flex items-center gap-2">
                       <div className="flex items-center gap-2 text-sm">
                         <User className="h-4 w-4" />
                         <span className="hidden sm:inline">{user.full_name || user.username || user.email}</span>
                       </div>
                       <Link href="/upload">
                         <Button variant="outline" size="sm">
                           <Upload className="h-4 w-4 mr-1" />
                           <span className="hidden sm:inline">{t('nav.upload')}</span>
                         </Button>
                       </Link>
                       <Button variant="ghost" size="sm" onClick={handleSignOut}>
                         <LogOut className="h-4 w-4" />
                       </Button>
                     </div>
                   ) : (
                     <>
                       <Link href="/login">
                         <Button variant="ghost" size="sm">
                           {t('nav.login')}
                         </Button>
                       </Link>
                       <Link href="/register">
                         <Button size="sm">
                           {t('nav.register')}
                         </Button>
                       </Link>
                     </>
                   )}
                 </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;