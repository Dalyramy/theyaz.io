import React from 'react';
import Navbar from '@/components/Navbar';
import EnhancedGallery from '@/components/gallery/EnhancedGallery';
import { motion } from 'framer-motion';

const EnhancedGalleryPage: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
      style={{
        backgroundImage: "url('/icons/peace-watermark.svg')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        opacity: 1,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/80 z-0" />
      <div className="relative z-10">
        <Navbar />
        <EnhancedGallery />
      </div>
    </div>
  );
};

export default EnhancedGalleryPage; 