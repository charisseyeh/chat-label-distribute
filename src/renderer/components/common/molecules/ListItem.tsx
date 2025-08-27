import React from 'react';
import { Chip } from '../atoms/Chip';
import { CheckToggle } from '../atoms/CheckToggle';

export interface ListItemProps {
  variant: 'check-chip-single' | 'check-single' | 'double' | 'double-chip';
  title: string;
  metadata: string | string[];
  chip?: {
    variant: 'relevant' | 'not-relevant' | 'selected' | 'currently-using';
    text: string;
  };
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
  onDelete?: () => void;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  variant,
  title,
  metadata,
  chip,
  checked = false,
  onCheckChange,
  onDelete,
  className = '',
  onClick,
  selected = false
}) => {
  const baseClasses = 'list-item';
  const variantClasses = `list-item--${variant}`;
  const selectedClasses = selected ? 'list-item--selected' : '';
  
  const hasCheckToggle = variant.startsWith('check');
  const hasChip = variant.includes('chip');
  const isSingleMetadata = variant.includes('single');
  
  const metadataArray = Array.isArray(metadata) ? metadata : [metadata];
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
    >
      {/* Check Toggle */}
      {hasCheckToggle && (
        <CheckToggle
          checked={checked}
          onChange={onCheckChange || (() => {})}
          aria-label={`Select ${title}`}
        />
      )}
      
      {/* Content */}
      <div className="list-item__content">
        <div className="list-item__title">
          <span className="list-item__title-text">{title}</span>
          {hasChip && chip && (
            <Chip variant={chip.variant}>
              {chip.text}
            </Chip>
          )}
        </div>
        <div className={`list-item__metadata ${isSingleMetadata ? 'list-item__metadata--single' : 'list-item__metadata--double'}`}>
          {metadataArray.map((text, index) => (
            <span key={index} className="list-item__metadata-text">
              {text}
            </span>
          ))}
        </div>
      </div>
      
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="list-item__delete-btn"
          aria-label="Delete item"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="list-item__delete-icon"
          >
            <path
              d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128v144Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
      
      {/* Remove the old chip positioning */}
    </div>
  );
};
