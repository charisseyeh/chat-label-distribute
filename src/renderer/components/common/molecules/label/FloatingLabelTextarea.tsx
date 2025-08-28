import React, { useState } from 'react';

interface FloatingLabelTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export const FloatingLabelTextarea: React.FC<FloatingLabelTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-3 py-2
          border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 resize-none
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />
      <label
        className="absolute left-3 top-1 text-xs pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
};
