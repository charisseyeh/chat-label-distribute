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
            className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2 flex-shrink-0"
            title={`Remove ${label} from selection`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
