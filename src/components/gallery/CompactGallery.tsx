import React from 'react';
import EnhancedGallery from './EnhancedGallery';

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
      <EnhancedGallery 
        className={className}
        showHeader={false}
        limit={limit}
      />
    </div>
  );
};

export default CompactGallery; 