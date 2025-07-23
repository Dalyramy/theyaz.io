import React from 'react';
import Gallery from '../Gallery';

interface CompactGalleryProps {
  className?: string;
  limit?: number;
}

const CompactGallery: React.FC<CompactGalleryProps> = ({ 
  className = "", 
  limit = 6 
}) => {
  return (
    <div className={`mobile-optimized ${className}`}>
      <Gallery />
    </div>
  );
};

export default CompactGallery; 