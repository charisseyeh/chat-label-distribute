import React, { useState, useEffect } from 'react';

interface RatingScaleProps {
  scale: number;
  labels: Record<number, string>;
  currentRating: number;
  onRatingChange: (rating: number) => void;
}

const RatingScale: React.FC<RatingScaleProps> = ({
  scale,
  labels,
  currentRating,
  onRatingChange
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    onRatingChange(rating);
  };

  const handleKeyPress = (event: React.KeyboardEvent, rating: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRatingChange(rating);
    }
  };

  return (
    <div className="space-y-2">
      {/* Rating Buttons */}
      <div className="flex items-center space-x-1">
        {Array.from({ length: scale }, (_, i) => {
          const rating = i + 1;
          const isSelected = currentRating === rating;
          const isHovered = hoveredRating === rating;
          const label = labels[rating] || rating.toString();

          return (
            <div key={rating} className="flex flex-col items-center space-y-2">
              {/* Rating Button */}
              <button
                onClick={() => handleRatingClick(rating)}
                onKeyPress={(e) => handleKeyPress(e, rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className={`rating-button ${isSelected ? 'rating-button--selected' : ''}`}
                aria-label={`Rate ${rating}: ${label}`}
                aria-pressed={isSelected}
                tabIndex={0}
              >
                {rating}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Label - Show below the entire rating selector */}
      {(hoveredRating || currentRating) ? (
        <div className="text-left">
          <div className={`
            text-small italic transition-all duration-200
            ${currentRating ? 'text-primary-600' : 'text-muted-foreground'}
          `}>
            {hoveredRating ? labels[hoveredRating] : labels[currentRating]}
          </div>
        </div>
      ) : (
        <div className="text-left">
          <div className="text-small italic text-muted-foreground">
            Select a rating
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingScale;
