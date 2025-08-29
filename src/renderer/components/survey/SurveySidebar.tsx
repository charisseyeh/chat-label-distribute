import React, { useEffect, useState, useCallback } from 'react';
import { useSurveyQuestions } from '../../hooks/survey/useSurveyQuestions';
import { useSurveyResponses } from '../../hooks/survey/useSurveyResponses';
import { useConversationStore } from '../../stores/conversationStore';
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

  // Instead of relying on props, listen to scroll tracking state directly
  // You could create a hook that subscribes to scroll tracking state
  // or use the existing scroll tracking service state

  // For now, let's use a simple approach - show sections based on message count
  // Remove the useEffect that was manually setting sections based on message count
  // since we now rely on the scroll tracking callbacks
  
  // Remove this effect:
  // useEffect(() => {
  //   if (messages.length === 0) return;
  //   // Turn 6 and end sections are now controlled by message visibility tracking
  //   // No need to manually check scroll percentage
  // }, [messages.length]);

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

  if (!currentTemplate) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">
          <p>No survey template available</p>
          <p className="text-sm">Please create a template in Survey Questions</p>
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
