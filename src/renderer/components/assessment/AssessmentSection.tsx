import React, { useState, useEffect } from 'react';
import { AssessmentSection as AssessmentSectionType, AssessmentResponse } from '../../types/assessment';
import { useAssessmentResponseStore } from '../../stores/assessmentResponseStore';
import QuestionDisplay from './QuestionDisplay';

interface AssessmentSectionProps {
  section: AssessmentSectionType;
  onResponse: (questionId: string, position: 'beginning' | 'turn6' | 'end', rating: number) => void;
  isVisible: boolean;
  conversationId: string;
}

const AssessmentSection: React.FC<AssessmentSectionProps> = ({ 
  section, 
  onResponse, 
  isVisible,
  conversationId
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Subscribe to conversation-specific responses instead of filtering global responses
  const conversationData = useAssessmentResponseStore(state => state.conversationData[conversationId]);
  const storeResponses = conversationData?.responses || [];
  
  // Filter responses for this specific section position
  const sectionResponses = storeResponses.filter(r => r.position === section.position);

  // Debug logging - consolidated into single useEffect
  useEffect(() => {
    if (isVisible && section.questions[currentQuestionIndex]) {
      const currentQuestion = section.questions[currentQuestionIndex];
      // Removed debug logging
    }
  }, [isVisible, section.questions, currentQuestionIndex, sectionResponses, storeResponses, section.position]);

  if (!isVisible) {
    return null;
  }

  const totalQuestions = section.questions.length;
  const currentQuestion = section.questions[currentQuestionIndex];

  const handleQuestionResponse = (questionId: string, rating: number) => {
    onResponse(questionId, section.position, rating);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="container-lg text-center text-muted-foreground">
        <p>No questions available for this section</p>
      </div>
    );
  }

  // Use section responses for current rating to ensure UI updates
  const currentRating = sectionResponses.find((r: AssessmentResponse) => r.questionId === currentQuestion.id)?.rating || 0;

  return (
    <div className="container-lg">
      {/* Simple Question Display */}
      <div className="space-y-2">
        {/* Question Header */}
        <div className="text-left">
          <div className="text-small text-muted-foreground mb-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <h3 className="text-h3 text-foreground leading-tight">
            {currentQuestion.text}
          </h3>
        </div>

        {/* Rating Scale */}
        <div className="flex justify-start">
          <QuestionDisplay
            question={currentQuestion}
            currentRating={currentRating}
            onRatingChange={(rating) => handleQuestionResponse(currentQuestion.id, rating)}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>

        {/* Navigation */}
        {totalQuestions > 1 && (
          <div className="flex items-center justify-start space-x-2">
            {/* Show Previous button only when not on first question */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={goToPreviousQuestion}
                className="btn-outline btn-sm"
              >
                Previous
              </button>
            )}
            
            {/* Show Next button only when not on last question */}
            {currentQuestionIndex < totalQuestions - 1 && (
              <button
                onClick={goToNextQuestion}
                className="btn-primary btn-sm"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentSection;
