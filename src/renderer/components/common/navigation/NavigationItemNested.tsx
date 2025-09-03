import React from 'react';

interface NavigationItemNestedProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  onRemove?: () => void;
  className?: string;
}

export const NavigationItemNested: React.FC<NavigationItemNestedProps> = ({
  label,
  isActive = false,
  onClick,
  onRemove,
  className = ''
}) => {
  return (
    <div className="group">
      <div 
        className={`nav-item nav-item-nested flex items-center justify-between cursor-pointer ${
          isActive ? 'active' : ''
        } ${className}`}
        onClick={onClick}
        title={`Click to view: ${label}`}
      >
        <span className="flex-1 text-left truncate">
          {label}
        </span>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="nav-remove-btn ml-2 flex-shrink-0"
            title={`Remove ${label} from selection`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
