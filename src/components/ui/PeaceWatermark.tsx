import React from 'react';

interface PeaceWatermarkProps {
  className?: string;
  size?: number;
  opacity?: number;
  rotation?: number;
}

const PeaceWatermark: React.FC<PeaceWatermarkProps> = ({
  className = '',
  size = 400,
  opacity = 10,
  rotation = -15
}) => {
  return (
    <div 
      className={`fixed bottom-4 left-4 pointer-events-none z-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: 'url(/icons/peace-watermark.svg)',
        backgroundSize: 'contain',
        backgroundPosition: 'bottom left',
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${rotation}deg)`,
        filter: 'blur(0.5px)',
        opacity: opacity / 100,
      }}
    />
  );
};

export default PeaceWatermark;