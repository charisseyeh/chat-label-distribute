import React from 'react';
import { AssessmentQuestion } from '../../types/assessment';
import RatingScale from './RatingScale';

interface QuestionDisplayProps {
  question: AssessmentQuestion;
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
      {/* Rating Scale */}
      <div className="flex justify-center">
        <RatingScale
          scale={question.scale}
          labels={question.labels}
          currentRating={currentRating}
          onRatingChange={handleRatingChange}
        />
      </div>
    </div>
  );
};

export default QuestionDisplay;
