import React, { useState } from 'react';

interface FloatingLabelSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
  noBorder?: boolean;
}

export const FloatingLabelSelect: React.FC<FloatingLabelSelectProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
  disabled = false,
  noBorder = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`
          w-full px-3 pt-6 pb-3 h-14 text-sm
          ${noBorder ? 'border-0 focus:ring-0' : 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}
          focus:outline-none
          transition-all duration-200 appearance-none
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className="absolute left-3 top-2 text-xs pointer-events-none"
      >
        {label}
      </label>
      {/* Custom dropdown arrow */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
