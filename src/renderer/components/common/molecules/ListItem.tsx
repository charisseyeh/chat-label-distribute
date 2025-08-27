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
        <div className="list-item__title">{title}</div>
        <div className={`list-item__metadata ${isSingleMetadata ? 'list-item__metadata--single' : 'list-item__metadata--double'}`}>
          {metadataArray.map((text, index) => (
            <span key={index} className="list-item__metadata-text">
              {text}
            </span>
          ))}
        </div>
      </div>
      
      {/* Chip */}
      {hasChip && chip && (
        <div className="list-item__chip">
          <Chip variant={chip.variant}>
            {chip.text}
          </Chip>
        </div>
      )}
    </div>
  );
};
