import React, { useState, useEffect } from 'react';
import { SurveySection as SurveySectionType, SurveyResponse } from '../../types/survey';
import { useSurveyResponseStore } from '../../stores/surveyResponseStore';
import QuestionDisplay from './QuestionDisplay';

interface SurveySectionProps {
  section: SurveySectionType;
  onResponse: (questionId: string, position: 'beginning' | 'turn6' | 'end', rating: number) => void;
  isVisible: boolean;
  conversationId: string;
}

const SurveySection: React.FC<SurveySectionProps> = ({ 
  section, 
  onResponse, 
  isVisible,
  conversationId
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Subscribe to conversation-specific responses instead of filtering global responses
  const conversationData = useSurveyResponseStore(state => state.conversationData[conversationId]);
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        <p>No questions available for this section</p>
      </div>
    );
  }

  // Use section responses for current rating to ensure UI updates
  const currentRating = sectionResponses.find((r: SurveyResponse) => r.questionId === currentQuestion.id)?.rating || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Simple Question Display */}
      <div className="space-y-6">
        {/* Question Header */}
        <div className="text-left">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
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
          <div className="flex items-center justify-start space-x-4">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveySection;
