import { motion } from 'framer-motion';
import { Camera, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

interface HeroSectionProps {
  handleExploreClick: () => void;
}

const HeroSection = ({ handleExploreClick }: HeroSectionProps) => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Watermark Logo */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Logo 
          width="100vw" 
          height="100vw" 
          className="opacity-10 blur-sm mx-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ maxWidth: '1200px', maxHeight: '1200px' }}
        />
      </div>
      <div className="absolute inset-0 opacity-30 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted via-background to-background"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container relative z-20 mx-auto px-4"
      >
        <div className="mx-auto max-w-3xl text-center">
          <Logo width={180} height={180} className="mx-auto mb-8" />
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-5xl font-bold leading-tight tracking-tighter sm:text-6xl md:text-7xl text-foreground"
          >
            Capture. Create. Connect.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 text-lg text-muted-foreground md:text-xl"
          >
            Join a vibrant community of creators and explorers. Share your unique moments, discover inspiration, and let your photography shine.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleUploadClick}
            >
              <Camera className="mr-2 h-5 w-5" />
              📸 Upload Your Photo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border text-foreground hover:bg-muted/10"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
        onClick={handleExploreClick}
      >
        <ArrowDown className="h-6 w-6 animate-bounce" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
