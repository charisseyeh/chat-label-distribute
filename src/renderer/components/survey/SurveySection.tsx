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
    // Get the current question text for better context
    const currentQuestion = section.questions.find(q => q.id === questionId);
    const questionText = currentQuestion?.text || questionId;
    
    console.log('📝 Survey Response Submitted:', {
      turn: section.position,
      question: `${currentQuestionIndex + 1}/${section.questions.length}`,
      questionId: questionId,
      questionText: questionText.substring(0, 50) + '...', // First 50 chars
      rating: rating,
      conversationId: conversationId
    });
    
    onResponse(questionId, section.position, rating);
    
    // Only log localStorage after a response is submitted
    setTimeout(() => {
      const responseStorage = localStorage.getItem('survey-response-storage');
      if (responseStorage) {
        const parsed = JSON.parse(responseStorage);
        const latestResponse = parsed.state?.responses?.[parsed.state.responses.length - 1];
        
        if (latestResponse) {
          console.log('💾 Response Stored Successfully:', {
            turn: latestResponse.position,
            questionId: latestResponse.questionId,
            rating: latestResponse.rating,
            timestamp: latestResponse.timestamp,
            conversationId: latestResponse.conversationId
          });
        }
        
        // Show summary for this specific conversation
        const conversationResponses = parsed.state?.conversationData?.[conversationId]?.responses || [];
        const turnResponses = conversationResponses.filter((r: any) => r.position === section.position);
        
        console.log('📊 Current Turn Summary:', {
          turn: section.position,
          questionsAnswered: turnResponses.length,
          totalQuestions: section.questions.length,
          completion: `${turnResponses.length}/${section.questions.length}`
        });
      }
    }, 200);
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-muted-foreground">
        <p>No questions available for this section</p>
      </div>
    );
  }

  // Use section responses for current rating to ensure UI updates
  const currentRating = sectionResponses.find((r: SurveyResponse) => r.questionId === currentQuestion.id)?.rating || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
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
                className="btn btn-ghost btn-sm"
              >
                Previous
              </button>
            )}
            
            {/* Show Next button only when not on last question */}
            {currentQuestionIndex < totalQuestions - 1 && (
              <button
                onClick={goToNextQuestion}
                className="btn btn-primary btn-sm"
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

export default SurveySection;
