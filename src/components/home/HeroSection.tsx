import { motion } from 'framer-motion';
import { Camera, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

interface HeroSectionProps {}

const HeroSection = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/upload');
  };
  const handleExploreClick = () => {
    // Removed navigation to /public-gallery
  };

  return (
    <section className="fixed inset-0 min-h-screen w-screen flex items-center justify-center overflow-hidden bg-background z-0 px-2 pt-safe-top pb-safe-bottom">
      {/* Watermark Logo removed */}
      <div className="absolute inset-0 opacity-30 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted via-background to-background"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container relative z-20 mx-auto px-2 sm:px-4 h-full flex items-center justify-center"
      >
        <div className="flex items-center justify-center w-full h-full">
          <Logo style={{ maxWidth: '90vw', maxHeight: '60vh', minWidth: '120px' }} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={handleExploreClick}
        style={{ touchAction: 'manipulation' }}
      >
        <button
          className="rounded-full bg-card/80 shadow-lg p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-primary active:bg-primary/10"
          style={{ minWidth: 48, minHeight: 48 }}
          aria-label="Scroll to gallery"
        >
          <ArrowDown className="h-7 w-7 animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
