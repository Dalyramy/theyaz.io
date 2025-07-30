import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'brand' | 'primary' | 'secondary';
}

const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = "",
  variant = "brand" 
}) => {
  const gradientClasses = {
    brand: "bg-gradient-to-r from-[#00ff00] to-[#4b94cc] bg-clip-text text-transparent",
    primary: "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
    secondary: "bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent"
  };

  return (
    <span className={cn(gradientClasses[variant], className)}>
      {children}
    </span>
  );
};

export default GradientText; 