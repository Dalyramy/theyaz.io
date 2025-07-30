import React from 'react';

interface PeaceWatermarkProps {
  className?: string;
}

const PeaceWatermark: React.FC<PeaceWatermarkProps> = ({ className = "" }) => {
  return (
    <div 
      className={`fixed bottom-4 left-4 pointer-events-none opacity-6 z-0 ${className}`}
      style={{
        width: '300px',
        height: '300px',
        backgroundImage: 'url(/icons/peace-800.svg)',
        backgroundSize: 'contain',
        backgroundPosition: 'bottom left',
        backgroundRepeat: 'no-repeat',
        transform: 'rotate(-10deg)',
      }}
    />
  );
};

export default PeaceWatermark;