import React from 'react';

interface NavigationItemProps {
  icon: string | React.ReactElement;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`nav-item nav-item-with-icon ${isActive ? 'active' : ''} ${className}`}
    >
      <span className="nav-item-icon">
        {typeof icon === 'string' ? icon : icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
};
