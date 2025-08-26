import React, { useState } from 'react';
import { SurveySection as SurveySectionType, SurveyResponse } from '../../types/survey';
import QuestionDisplay from './QuestionDisplay';

interface SurveySectionProps {
  section: SurveySectionType;
  responses: SurveyResponse[];
  onResponse: (questionId: string, position: 'beginning' | 'turn6' | 'end', rating: number) => void;
  isVisible: boolean;
}

const SurveySection: React.FC<SurveySectionProps> = ({ 
  section, 
  responses, 
  onResponse, 
  isVisible 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible) {
    return null;
  }

  const totalQuestions = section.questions.length;
  const answeredQuestions = responses.length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'beginning':
        return '🚀';
      case 'turn6':
        return '🔄';
      case 'end':
        return '🏁';
      default:
        return '📝';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'beginning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'turn6':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'end':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm transition-all duration-300 ${
      section.isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
    }`}>
      {/* Section Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPositionIcon(section.position)}</span>
            <div>
              <h4 className="font-medium text-gray-900">{section.title}</h4>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Position Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPositionColor(section.position)}`}>
              {section.position.toUpperCase()}
            </span>
            
            {/* Completion Status */}
            {section.isCompleted && (
              <span className="text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            {/* Expand/Collapse Icon */}
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress: {answeredQuestions}/{totalQuestions} questions</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Question Navigation */}
          {totalQuestions > 1 && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalQuestions }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-6 h-6 text-xs rounded-full transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : responses.find(r => r.questionId === section.questions[index]?.id)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Current Question */}
          {section.questions.length > 0 && (
            <div className="p-4">
              <QuestionDisplay
                question={section.questions[currentQuestionIndex]}
                currentRating={responses.find(r => r.questionId === section.questions[currentQuestionIndex]?.id)?.rating || 0}
                onRatingChange={(rating) => handleQuestionResponse(section.questions[currentQuestionIndex].id, rating)}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
              />
            </div>
          )}

          {/* No Questions Message */}
          {section.questions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>No questions configured for this section</p>
              <p className="text-sm">Please add questions in the Survey Questions page</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveySection;
