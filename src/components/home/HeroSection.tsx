
import { motion } from 'framer-motion';
import { Camera, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  handleExploreClick: () => void;
}

const HeroSection = ({ handleExploreClick }: HeroSectionProps) => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-100 to-background dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 opacity-30 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-200 via-gray-100 to-background dark:from-gray-800 dark:via-gray-900 dark:to-black"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container relative z-10 mx-auto px-4"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-5xl font-bold leading-tight tracking-tighter sm:text-6xl md:text-7xl text-gray-900 dark:text-white"
          >
            Discover and Share Amazing Photos
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 text-lg text-gray-700 dark:text-gray-100 md:text-xl"
          >
            Join our community of photographers and enthusiasts. Share your best shots and explore stunning photography from around the world.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transform transition-transform hover:scale-105"
              onClick={handleUploadClick}
            >
              <Camera className="mr-2 h-5 w-5" />
              Upload Photo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-900 text-gray-900 hover:bg-gray-900/10 dark:border-white dark:text-white dark:hover:bg-white/10 backdrop-blur-sm transform transition-transform hover:scale-105"
              onClick={handleExploreClick}
            >
              Explore Gallery
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 dark:text-white/50 cursor-pointer hover:text-gray-700 dark:hover:text-white/80 transition-colors"
        onClick={handleExploreClick}
      >
        <ArrowDown className="h-6 w-6 animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
