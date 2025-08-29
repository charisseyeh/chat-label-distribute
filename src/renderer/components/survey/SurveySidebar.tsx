import React, { useEffect, useState, useCallback } from 'react';
import { useSurveyQuestions } from '../../hooks/survey/useSurveyQuestions';
import { useSurveyResponses } from '../../hooks/survey/useSurveyResponses';
import { useConversationStore } from '../../stores/conversationStore';
import { SurveySection as SurveySectionType } from '../../types/survey';
import SurveySection from './SurveySection';

interface SurveySidebarProps {
  conversationId: string;
  messages: any[];
  onTurn6Reached?: () => void;
  onEndReached?: () => void;
}

const SurveySidebar: React.FC<SurveySidebarProps> = ({ 
  conversationId, 
  messages, 
  onTurn6Reached, 
  onEndReached 
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

  // Memoize the callback functions to prevent infinite re-renders
  const handleTurn6Reached = useCallback(() => {
    setVisibleSections(prev => ({ ...prev, turn6: true }));
    onTurn6Reached?.();
  }, [onTurn6Reached]);

  const handleEndReached = useCallback(() => {
    setVisibleSections(prev => ({ ...prev, end: true }));
    onEndReached?.();
  }, [onEndReached]);

  // Listen for scroll tracking events from ConversationDisplay
  useEffect(() => {
    if (onTurn6Reached) {
      handleTurn6Reached();
    }
  }, [onTurn6Reached, handleTurn6Reached]);

  useEffect(() => {
    if (onEndReached) {
      handleEndReached();
    }
  }, [onEndReached, handleEndReached]);

  // Reset visible sections when conversation changes
  useEffect(() => {
    console.log('🔄 SurveySidebar: Conversation changed:', conversationId);
    setVisibleSections({
      beginning: true, // Always visible
      turn6: false,    // Hidden until scroll threshold
      end: false       // Hidden until scroll threshold
    });
  }, [conversationId]);

  // Update visible sections based on message visibility tracking
  useEffect(() => {
    if (messages.length === 0) return;

    // Turn 6 and end sections are now controlled by message visibility tracking
    // No need to manually check scroll percentage
  }, [messages.length]); // Only depend on messages.length

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
