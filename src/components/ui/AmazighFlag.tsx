import React from 'react';

interface AmazighFlagProps {
  className?: string;
  size?: number;
}

const AmazighFlag: React.FC<AmazighFlagProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 30 18"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Blue stripe */}
      <rect x="0" y="0" width="30" height="6" fill="#0066CC" />
      
      {/* Green stripe */}
      <rect x="0" y="6" width="30" height="6" fill="#009900" />
      
      {/* Yellow stripe */}
      <rect x="0" y="12" width="30" height="6" fill="#FFCC00" />
      
      {/* Red Tifinagh Z symbol */}
      <path
        d="M15 3 L15 15 M12 6 L18 6 M12 12 L18 12"
        stroke="#CC0000"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
};

export default AmazighFlag; 