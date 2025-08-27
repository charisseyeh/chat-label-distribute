import React from 'react';

export interface ChipProps {
  variant: 'relevant' | 'not-relevant' | 'selected' | 'currently-using';
  children: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ variant, children, className = '' }) => {
  const baseClasses = 'chip';
  const variantClasses = `chip--${variant}`;
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
