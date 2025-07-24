import { Link } from "react-router-dom";
import { Upload, Camera, Image as ImageIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import NotificationBell from '@/components/notifications/NotificationBell';
import Logo from '@/components/ui/Logo';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    drawer.addEventListener('keydown', handleKeyDown);
    return () => drawer.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-safe-top z-50 w-full border-b border-gray-200 dark:border-border/40 bg-white/60 dark:bg-background/60 backdrop-blur-xl shadow-lg rounded-b-2xl supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-background/40"
    >
      <div
        className="container flex items-center justify-between px-4 sm:px-8 py-2 sm:py-3 gap-4"
      >
        <Link
          to="/"
          className="flex items-center gap-3 sm:gap-5 transition-all hover:scale-105"
        >
          <Logo style={{ width: 40, height: 40 }} />
          <span
            className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(90deg, #00ff00 0%, #4b94cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.05em"
            }}
          >
            theyaz.io
          </span>
        </Link>
        {/* Hamburger menu for mobile */}
        <button
          className="sm:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? t('nav.close_menu', 'Close menu') : t('nav.open_menu', 'Open menu')}
          aria-expanded={mobileMenuOpen ? 'true' : 'false'}
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
        {/* Desktop nav */}
        <nav className="flex items-center gap-2 sm:gap-6 h-full">
          <motion.div 
            className="hidden sm:flex items-center gap-4 sm:gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div variants={navItemVariants} className="hidden sm:block">
              <Link 
                to="/" 
                className={cn(
                  "text-lg sm:text-2xl font-semibold transition-colors hover:text-accent focus:text-accent text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary px-2 py-1 rounded-lg hover:bg-primary/10 focus:bg-primary/20",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
                )}
              >
                {t('nav.home')}
              </Link>
            </motion.div>

                        {user && (
              <motion.div variants={navItemVariants} className="hidden sm:block">
                {/* Removed /public-gallery link */}
              </motion.div>
            )}

            <motion.div variants={navItemVariants} className="hidden sm:block">
              <Link 
                to="/gallery" 
                className={cn(
                  "text-lg sm:text-2xl font-semibold transition-colors hover:text-accent focus:text-accent text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary px-2 py-1 rounded-lg hover:bg-primary/10 focus:bg-primary/20",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
                )}
              >
                ⴳⴰⵍⵍⴻⵔⵢ
              </Link>
            </motion.div>
            
            {isAdmin && (
              <motion.div variants={navItemVariants} className="hidden sm:block">
                <Link 
                  to="/admin" 
                  className={cn(
                    "text-lg sm:text-2xl font-semibold transition-colors hover:text-accent focus:text-accent text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary px-2 py-1 rounded-lg hover:bg-primary/10 focus:bg-primary/20",
                    "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
                  )}
                >
                  <Shield className="h-5 w-5 inline mr-1" />
                  {t('nav.admin')}
                </Link>
              </motion.div>
            )}
            
            <motion.div variants={navItemVariants} className="hidden sm:block">
              <Link 
                to="/about" 
                className={cn(
                  "text-lg sm:text-2xl font-semibold transition-colors hover:text-accent focus:text-accent text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary px-2 py-1 rounded-lg hover:bg-primary/10 focus:bg-primary/20",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
                )}
              >
                {t('nav.about')}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="hidden sm:block">
              <Link 
                to="/trans" 
                className={cn(
                  "text-lg sm:text-2xl font-semibold transition-colors hover:text-accent focus:text-accent text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary px-2 py-1 rounded-lg hover:bg-primary/10 focus:bg-primary/20",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
                )}
              >
                {t('nav.trans')}
              </Link>
            </motion.div>
          </motion.div>
          
          <div className="flex items-center gap-3">
            {user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild
                  variant="default" 
                  size="sm" 
                  className="h-8 rounded-full px-4 text-sm font-medium bg-secondary hover:bg-secondary/90 shadow-md"
                >
                  <Link to="/upload" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>{t('nav.share')}</span>
                  </Link>
                </Button>
              </motion.div>
            )}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LanguageSelector />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserMenu />
            </motion.div>
          </div>
        </nav>
      </div>
      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex" aria-hidden={mobileMenuOpen ? 'false' : 'true'}>
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            className="bg-background w-4/5 max-w-xs h-full shadow-2xl p-6 flex flex-col gap-4 transition-transform duration-300 ease-in-out transform translate-x-0 rounded-r-2xl border-r border-border focus:outline-none animate-slide-in-left"
            tabIndex={-1}
          >
            <button
              className="self-end mb-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-accent hover:bg-accent/70 active:bg-accent/90 transition"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t('nav.close_menu', 'Close menu')}
            >
              <X className="w-7 h-7" />
            </button>
            <Link to="/" className="text-xl font-bold py-2 rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
            <Link to="/gallery" className="text-xl font-bold py-2 rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>ⴳⴰⵍⵍⴻⵔⵢ</Link>
            {isAdmin && (
              <Link to="/admin" className="text-xl font-bold py-2 flex items-center rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>
                <Shield className="h-5 w-5 mr-1" />
                {t('nav.admin')}
              </Link>
            )}
            <Link to="/about" className="text-xl font-bold py-2 rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>{t('nav.about')}</Link>
            <Link to="/trans" className="text-xl font-bold py-2 rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>{t('nav.trans')}</Link>
            {user && (
              <Link to="/upload" className="text-xl font-bold py-2 flex items-center gap-2 rounded-lg hover:bg-accent/30 active:bg-accent/60 transition" onClick={() => setMobileMenuOpen(false)}>
                <ImageIcon className="h-5 w-5" />
                {t('nav.share')}
              </Link>
            )}
            <hr className="my-2 border-border" />
            <div className="flex gap-2 mt-2">
              <LanguageSelector />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
          {/* Click outside to close */}
          <div className="flex-1 cursor-pointer" aria-hidden onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </motion.header>
  );
};

export default Navbar;