import React from 'react';
import { SurveyQuestion } from '../../types/survey';
import RatingScale from './RatingScale';

interface QuestionDisplayProps {
  question: SurveyQuestion;
  currentRating: number;
  onRatingChange: (rating: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  currentRating,
  onRatingChange,
  questionNumber,
  totalQuestions
}) => {
  const handleRatingChange = (rating: number) => {
    onRatingChange(rating);
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          Question {questionNumber} of {totalQuestions}
        </div>
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.text}
        </h3>
      </div>

      {/* Rating Scale */}
      <div className="flex justify-center">
        <RatingScale
          scale={question.scale}
          labels={question.labels}
          currentRating={currentRating}
          onRatingChange={handleRatingChange}
        />
      </div>

      {/* Question Info */}
      <div className="text-center text-sm text-gray-600">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
          <span>Scale: 1-{question.scale}</span>
          {question.category && (
            <>
              <span>•</span>
              <span className="capitalize">{question.category}</span>
            </>
          )}
        </div>
      </div>

      {/* Current Rating Display */}
      {currentRating > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
            <span className="font-medium">Current Rating:</span>
            <span className="font-bold text-lg">{currentRating}</span>
            <span className="text-sm">({question.labels[currentRating]})</span>
          </div>
        </div>
      )}

      {/* Rating Instructions */}
      <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>Click on a rating button to select your assessment</p>
        <p>Your response will be automatically saved</p>
      </div>
    </div>
  );
};

export default QuestionDisplay;
