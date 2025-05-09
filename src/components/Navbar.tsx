import { Link } from "react-router-dom";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import NotificationBell from '@/components/notifications/NotificationBell';
import TheyazLogo from '@/components/ui/TheyazLogo';

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

const Navbar = () => {
  const { user } = useAuth();
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-safe-top z-50 w-full border-b bg-white/80 border-gray-200 dark:bg-background/80 dark:border-border/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-28 sm:h-32 items-center justify-between px-4 sm:px-8">
        <Link 
          to="/" 
          className="flex items-center gap-4 transition-all hover:scale-105"
        >
          <motion.div 
            className="flex items-center justify-center w-16 aspect-[401/622]"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <TheyazLogo size="100%" className="drop-shadow-[0_0_12px_#3b82f6] h-full w-full" />
          </motion.div>
          <span className="text-4xl font-bold tracking-tight flex items-center text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary">
            theyaz.io
          </span>
        </Link>
        
        <nav className="flex items-center gap-4 sm:gap-6">
          <motion.div 
            className="flex items-center gap-4 sm:gap-6"
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
                  "text-2xl font-bold transition-colors hover:text-secondary text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform hover:after:scale-x-100"
                )}
              >
                Home
              </Link>
            </motion.div>

            {user && (
              <motion.div variants={navItemVariants} className="hidden sm:block">
                <Link 
                  to="/gallery" 
                  className={cn(
                    "text-2xl font-bold transition-colors hover:text-secondary text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary",
                    "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform hover:after:scale-x-100"
                  )}
                >
                  Gallery
                </Link>
              </motion.div>
            )}
            
            {user && (
              <motion.div variants={navItemVariants} className="hidden sm:block">
                <Link 
                  to="/my-photos" 
                  className={cn(
                    "text-2xl font-bold transition-colors hover:text-secondary text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary",
                    "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform hover:after:scale-x-100"
                  )}
                >
                  My Photos
                </Link>
              </motion.div>
            )}
            
            <motion.div variants={navItemVariants} className="hidden sm:block">
              <Link 
                to="/about" 
                className={cn(
                  "text-2xl font-bold transition-colors hover:text-secondary text-primary dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-primary dark:to-secondary",
                  "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform hover:after:scale-x-100"
                )}
              >
                About
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
                  className="h-8 rounded-full px-4 text-sm font-medium bg-secondary hover:bg-secondary/90"
                >
                  <Link to="/upload" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Share</span>
                  </Link>
                </Button>
              </motion.div>
            )}
            
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
    </motion.header>
  );
};

export default Navbar;