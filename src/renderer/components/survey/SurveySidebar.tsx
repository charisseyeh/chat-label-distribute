import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../../hooks/survey/useSurveyQuestions';
import { useSurveyResponses } from '../../hooks/survey/useSurveyResponses';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { SurveySection as SurveySectionType } from '../../types/survey';
import SurveySection from './SurveySection';

interface SurveySidebarProps {
  conversationId: string;
  messages: any[];
  turn6Reached?: boolean;  // Change from callback to boolean
  endReached?: boolean;     // Change from callback to boolean
}

const SurveySidebar: React.FC<SurveySidebarProps> = ({ 
  conversationId, 
  messages, 
  turn6Reached = false,  // Change from callback to boolean
  endReached = false      // Change from callback to boolean
}) => {
  const navigate = useNavigate();
  const { setCurrentPage } = useNavigationStore();
  const { currentTemplate } = useSurveyQuestions();
  const { 
    responses, 
    isPositionCompleted, 
    getPositionProgress,
    autoSaveResponse 
  } = useSurveyResponses(conversationId);

  // Track visible survey sections
  const [visibleSections, setVisibleSections] = useState({
    beginning: true, // Always visible
    turn6: false,    // Appears when turn 6 is reached
    end: false       // Appears when end is reached
  });


  // Create survey sections data
  const surveySections: SurveySectionType[] = [
    {
      position: 'beginning',
      title: 'Beginning Assessment',
      description: 'Rate the pre-conversation state',
      isVisible: visibleSections.beginning,
      isCompleted: isPositionCompleted('beginning'),
      questions: currentTemplate?.questions || []
    },
    {
      position: 'turn6',
      title: 'Mid-Conversation Assessment',
      description: 'Rate the conversation after 6 exchanges',
      isVisible: visibleSections.turn6,
      isCompleted: isPositionCompleted('turn6'),
      questions: currentTemplate?.questions || []
    },
    {
      position: 'end',
      title: 'End Assessment',
      description: 'Rate the post-conversation state',
      isVisible: visibleSections.end,
      isCompleted: isPositionCompleted('end'),
      questions: currentTemplate?.questions || []
    }
  ];

  // Handle survey response
  const handleSurveyResponse = async (
    questionId: string,
    position: 'beginning' | 'turn6' | 'end',
    rating: number
  ) => {
    try {
      await autoSaveResponse(questionId, position, rating);
    } catch (error) {
      console.error('Failed to save survey response:', error);
    }
  };

  // Instead, we need to expose functions that the parent can call
  // to update our visibility state
  
  // Update visible sections based on the boolean props
  useEffect(() => {
    setVisibleSections(prev => ({ 
      ...prev, 
      turn6: turn6Reached 
    }));
  }, [turn6Reached]);

  useEffect(() => {
    setVisibleSections(prev => ({ 
      ...prev, 
      end: endReached 
    }));
  }, [endReached]);

  // The callbacks will be called by the parent when scroll tracking events occur
  // We just need to make sure our local state handlers are properly set up

  // Handle navigation to survey templates with proper state management
  const handleNavigateToTemplates = useCallback(() => {
    // Update navigation store to ensure proper page state
    setCurrentPage('survey-templates');
    // Navigate to survey templates page
    navigate('/survey-templates');
  }, [setCurrentPage, navigate]);

  if (!currentTemplate) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">No assessment questions available</p>
          <p className="text-sm mb-4">Please select assessments template or create a new one in assessment templates</p>
          <button
            onClick={handleNavigateToTemplates}
            className="btn-primary btn-md"
          >
            Select a template
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Survey Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {surveySections.map((section) => (
          <SurveySection
            key={section.position}
            section={section}
            onResponse={handleSurveyResponse}
            isVisible={section.isVisible}
            conversationId={conversationId}
          />
        ))}
      </div>


    </div>
  );
};

export default SurveySidebar;
