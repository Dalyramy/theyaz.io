import React from 'react';
import Navbar from '@/components/Navbar';
import EnhancedGallery from '@/components/gallery/EnhancedGallery';
import { motion } from 'framer-motion';

const EnhancedGalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <EnhancedGallery />
    </div>
  );
};

export default EnhancedGalleryPage; 