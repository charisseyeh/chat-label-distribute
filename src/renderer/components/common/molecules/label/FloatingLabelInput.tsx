import React, { useState } from 'react';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'date';
  className?: string;
  disabled?: boolean;
  showToggleButton?: boolean;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  showToggleButton = false,
  onToggleVisibility,
  isVisible = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  // Handle different input types properly
  const getInputType = () => {
    if (type === 'password' && !isVisible) return 'password';
    if (type === 'date') return 'date';
    return 'text';
  };

  // Handle date input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'date') {
      // For date inputs, pass the ISO date string directly
      onChange(e.target.value);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type={getInputType()}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
                  className={`
            w-full px-3 pt-6 pb-3 h-14
            border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${showToggleButton ? 'pr-12' : ''}
            ${type === 'date' ? 'text-xs' : ''}
          `}
      />
        <label
          className="absolute left-3 top-2 text-xs pointer-events-none"
        >
          {label}
        </label>
      
      {/* Eye Icon Toggle Button */}
      {showToggleButton && (
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isVisible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};
