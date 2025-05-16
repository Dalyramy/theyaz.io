import React from 'react';

export type LogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  size?: number | string;
};

export default function Logo({ size = 120, ...props }: LogoProps) {
  return (
    <img
      src="/icons/theyaz-logo.svg"
      alt="theyaz.io logo"
      width={size}
      height={size}
      {...props}
    />
  );
} 