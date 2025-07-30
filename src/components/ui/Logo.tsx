import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <img 
    src="/icons/theyaz-logo.svg" 
    alt="theyaz.io logo" 
    {...props}
  />
);

export default Logo; 