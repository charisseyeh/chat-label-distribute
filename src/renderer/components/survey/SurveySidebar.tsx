import React, { useEffect, useState, useCallback } from 'react';
import { useSurveyQuestions } from '../../hooks/useSurveyQuestions';
import { useSurveyResponses } from '../../hooks/useSurveyResponses';
import { useSurveyExport } from '../../hooks/useSurveyExport';
import { useScrollTracking } from '../../hooks/useScrollTracking';
import { SurveySection as SurveySectionType } from '../../types/survey';
import SurveySection from './SurveySection';

interface SurveySidebarProps {
  conversationId: string;
  messages: any[];
}

const SurveySidebar: React.FC<SurveySidebarProps> = ({ conversationId, messages }) => {
  const { currentTemplate } = useSurveyQuestions();
  const { 
    responses, 
    isPositionCompleted, 
    getPositionProgress,
    autoSaveResponse 
  } = useSurveyResponses(conversationId);
  const { exportConversationData, hasExportableData } = useSurveyExport();

  // Track visible survey sections
  const [visibleSections, setVisibleSections] = useState({
    beginning: true, // Always visible
    turn6: false,    // Appears when turn 6 is reached
    end: false       // Appears when end is reached
  });

  // Memoize the callback functions to prevent infinite re-renders
  const handleTurn6Reached = useCallback(() => {
    setVisibleSections(prev => ({ ...prev, turn6: true }));
  }, []);

  const handleEndReached = useCallback(() => {
    setVisibleSections(prev => ({ ...prev, end: true }));
  }, []);

  // Scroll tracking for progressive disclosure
  const { 
    turn6Reached, 
    endReached, 
    trackMessageVisibility,
    startTracking,
    stopTracking,
    resetTracking
  } = useScrollTracking({
    onTurn6Reached: handleTurn6Reached,
    onEndReached: handleEndReached
  });

  // Start scroll tracking when component mounts
  useEffect(() => {
    // Delay starting tracking to ensure DOM is ready
    const timer = setTimeout(() => {
      startTracking();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  // Reset tracking when conversation changes
  useEffect(() => {
    resetTracking();
  }, [conversationId, resetTracking]);

  // Track scroll position for turn 6 detection
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    if (messages.length === 0) return;

    const handleScroll = () => {
      // Find the specific messages container within ConversationViewer
      // This is the div with "messages-container" class
      const messagesContainer = document.querySelector('.conversation-viewer .messages-container') || 
                               document.querySelector('.messages-container') ||
                               document.querySelector('[class*="overflow-y-auto"]');
      
      if (!messagesContainer) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const percentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercentage(percentage);
      
      // Turn 6 should appear around 30-40% through the conversation
      if (percentage >= 30 && !visibleSections.turn6) {
        setVisibleSections(prev => ({ ...prev, turn6: true }));
      }
      
      // End should appear when near the bottom (90%+)
      if (percentage >= 90 && !visibleSections.end) {
        setVisibleSections(prev => ({ ...prev, end: true }));
      }
    };

    // Add scroll listener to the messages container
    const messagesContainer = document.querySelector('.conversation-viewer .messages-container') || 
                             document.querySelector('.messages-container') ||
                             document.querySelector('[class*="overflow-y-auto"]');
    
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages.length, visibleSections.turn6, visibleSections.end]);

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

  // Handle export
  const handleExport = async () => {
    try {
      await exportConversationData(conversationId, 'full');
    } catch (error) {
      console.error('Failed to export survey data:', error);
    }
  };

  // Update visible sections when scroll tracking changes
  useEffect(() => {
    if (turn6Reached) {
      setVisibleSections(prev => ({ ...prev, turn6: true }));
    }
  }, [turn6Reached]);

  useEffect(() => {
    if (endReached) {
      setVisibleSections(prev => ({ ...prev, end: true }));
    }
  }, [endReached]);

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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

      {/* Footer with Export */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {hasExportableData(conversationId) && (
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export Survey Data
          </button>
        )}
        
        {!hasExportableData(conversationId) && (
          <div className="text-center text-sm text-gray-500">
            Complete surveys to enable export
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveySidebar;
