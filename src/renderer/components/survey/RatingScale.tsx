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

  // Debug logging
  useEffect(() => {
    console.log('🔍 RatingScale Debug:', {
      scale,
      currentRating,
      labels,
      hoveredRating
    });
  }, [scale, currentRating, labels, hoveredRating]);

  const handleRatingClick = (rating: number) => {
    console.log('🎯 Rating clicked:', rating, 'Current rating was:', currentRating);
    onRatingChange(rating);
  };

  const handleKeyPress = (event: React.KeyboardEvent, rating: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRatingChange(rating);
    }
  };

  return (
    <div className="space-y-3">
      {/* Rating Buttons */}
      <div className="flex items-center space-x-2">
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
                className={`
                  w-7 h-7 rounded-full border-2 transition-all duration-200 ease-in-out
                  flex items-center justify-center text-xs font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                  }
                `}
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
        <div className="text-left pt-2">
          <div className={`
            text-sm italic text-gray-600 transition-all duration-200
            ${currentRating ? 'text-blue-600' : 'text-gray-600'}
          `}>
            {hoveredRating ? labels[hoveredRating] : labels[currentRating]}
          </div>
        </div>
      ) : (
        <div className="text-left pt-2">
          <div className="text-sm italic text-gray-500">
            Select a rating
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingScale;
