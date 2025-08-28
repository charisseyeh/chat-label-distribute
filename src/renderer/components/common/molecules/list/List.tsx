import React from 'react';
import { ListItem, ListItemProps } from './ListItem';

export interface ListProps {
  variant: 'with-dividers' | 'without-dividers';
  items: Omit<ListItemProps, 'variant'>[];
  listItemVariant: ListItemProps['variant'];
  className?: string;
  compact?: boolean;
  spacious?: boolean;
}

export const List: React.FC<ListProps> = ({
  variant,
  items,
  listItemVariant,
  className = '',
  compact = false,
  spacious = false
}) => {
  const baseClasses = 'list';
  const variantClasses = `list--${variant}`;
  const sizeClasses = compact ? 'list--compact' : spacious ? 'list--spacious' : '';
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          variant={listItemVariant}
          {...item}
        />
      ))}
    </div>
  );
};
