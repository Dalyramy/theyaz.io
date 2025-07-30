"use client"

import Link from "next/link";
import Logo from '@/components/ui/Logo';
import GradientText from '@/components/ui/GradientText';

const SimpleNavbar = () => {
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
            Home
          </Link>
          <Link href="/gallery" className="text-lg font-semibold hover:text-accent">
            Gallery
          </Link>
          <Link href="/about" className="text-lg font-semibold hover:text-accent">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default SimpleNavbar; 