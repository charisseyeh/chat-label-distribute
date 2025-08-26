import React from 'react';

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
    <div className="space-y-3">
      {/* Rating Buttons */}
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: scale }, (_, i) => {
          const rating = i + 1;
          const isSelected = currentRating === rating;
          const label = labels[rating] || rating.toString();

          return (
            <div key={rating} className="flex flex-col items-center space-y-2">
              {/* Rating Button */}
              <button
                onClick={() => handleRatingClick(rating)}
                onKeyPress={(e) => handleKeyPress(e, rating)}
                className={`
                  w-9 h-9 rounded-full border-2 transition-all duration-200 ease-in-out
                  flex items-center justify-center text-sm font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:scale-105'
                  }
                `}
                aria-label={`Rate ${rating}: ${label}`}
                aria-pressed={isSelected}
                tabIndex={0}
              >
                {rating}
              </button>
              
              {/* Label */}
              <div className="text-center">
                <div className={`
                  text-xs font-medium transition-colors duration-200
                  ${isSelected ? 'text-blue-600' : 'text-gray-600'}
                `}>
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale Range Indicator */}
      <div className="text-center text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {scale === 2 ? 'Binary Scale' : 
           scale === 3 ? '3-Point Scale' :
           scale === 5 ? '5-Point Scale' :
           scale === 7 ? '7-Point Scale' :
           scale === 10 ? '10-Point Scale' :
           `${scale}-Point Scale`}
        </span>
      </div>

      {/* Current Selection Summary */}
      {currentRating > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium">Selected:</span>
            <span className="font-bold">{currentRating}</span>
            <span className="text-sm">({labels[currentRating]})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingScale;
