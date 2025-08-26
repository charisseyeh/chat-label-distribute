import React, { useEffect, useState } from 'react';
import { useSurveyQuestions } from '../../hooks/useSurveyQuestions';
import { useSurveyResponses } from '../../hooks/useSurveyResponses';
import { useSurveyExport } from '../../hooks/useSurveyExport';
import { useScrollTracking } from '../../hooks/useScrollTracking';
import { SurveySection as SurveySectionType } from '../../types/survey';
import SurveySection from './SurveySection';
import SurveyProgress from './SurveyProgress';

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

  // Scroll tracking for progressive disclosure
  const { turn6Reached, endReached } = useScrollTracking({
    onTurn6Reached: () => setVisibleSections(prev => ({ ...prev, turn6: true })),
    onEndReached: () => setVisibleSections(prev => ({ ...prev, end: true }))
  });

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
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 py-8">
          <p>No survey template available</p>
          <p className="text-sm">Please create a template in Survey Questions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Assessment</h3>
        <p className="text-sm text-gray-600 mb-3">
          Rate the conversation at key points
        </p>
        
        {/* Progress Overview */}
        <SurveyProgress 
          totalQuestions={currentTemplate.questions.length * 3}
          answeredQuestions={responses.length}
          completedSections={surveySections.filter(s => s.isCompleted).map(s => s.position)}
        />
      </div>

      {/* Survey Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {surveySections.map((section) => (
          <SurveySection
            key={section.position}
            section={section}
            responses={responses.filter(r => r.position === section.position)}
            onResponse={handleSurveyResponse}
            isVisible={section.isVisible}
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
