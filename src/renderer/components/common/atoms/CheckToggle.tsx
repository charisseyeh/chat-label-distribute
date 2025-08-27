import React from 'react';

export interface CheckToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const CheckToggle: React.FC<CheckToggleProps> = ({ 
  checked, 
  onChange, 
  disabled = false, 
  className = '',
  'aria-label': ariaLabel 
}) => {
  const baseClasses = 'check-toggle';
  const checkedClasses = checked ? 'check-toggle--checked' : '';
  
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      className={`${baseClasses} ${checkedClasses} ${className}`}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="check-toggle__input"
      />
    </div>
  );
};
