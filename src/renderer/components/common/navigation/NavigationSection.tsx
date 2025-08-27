import React from 'react';

interface NavigationSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({
  children,
  className = ''
}) => {
  return (
    <nav className={`nav-container ${className}`}>
      {children}
    </nav>
  );
};
