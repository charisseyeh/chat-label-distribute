import React from 'react';
import { TwoPanelLayout } from '../components/common';
import { AIComparisonSidebar, AISimulationView } from '../components/ai-analysis';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { useSurveyQuestionStore } from '../stores/surveyQuestionStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAIPrompt } from '../hooks/ai/useAIPrompt';
import { useAIConfiguration } from '../hooks/ai/useAIConfiguration';
import { useConversationSelection } from '../hooks/conversation/useConversationSelection';

const AISimulationPage: React.FC = () => {
  // AI Simulation Page - Shows ProgressTracker in main content area
  const { getConversationData } = useSurveyResponseStore();
  const { currentTemplate } = useSurveyQuestionStore();
  const { conversations } = useConversationStore();
  const { generateOpenAIPrompt } = useAIPrompt();
  const { apiKey, model, setApiKey, setModel } = useAIConfiguration();
  const { selectedConversationIds, toggleConversationSelection } = useConversationSelection();

  // Get conversations with data for the sidebar
  const conversationsWithData = (conversations || []).map((conv: any) => ({
    id: conv.id,
    title: conv.title,
    data: getConversationData(conv.id),
    hasResponses: getConversationData(conv.id)?.responses?.length > 0,
    messageCount: conv.messageCount || 0
  }));

  return (
    <TwoPanelLayout
      sidebarContent={
        <AIComparisonSidebar
          conversationsWithData={conversationsWithData}
          selectedConversationIds={selectedConversationIds}
          onConversationToggle={toggleConversationSelection}
          apiKey={apiKey}
          model={model}
          onApiKeyChange={setApiKey}
          onModelChange={setModel}
          onGenerate={() => {}} // No-op for simulation
          isGenerating={false}
          hasSelectedConversations={selectedConversationIds.length > 0}
          currentTemplate={currentTemplate}
          storeConversations={conversations || []}
          generateOpenAIPrompt={generateOpenAIPrompt}
          onReviewPrompt={() => {}} // No-op for simulation
        />
      }
    >
      {/* Main Content Area - AI Simulation */}
      <div className="p-6 space-y-6">
        <AISimulationView
          currentTemplate={currentTemplate}
          selectedConversations={selectedConversationIds}
          storeConversations={conversations || []}
          generateOpenAIPrompt={generateOpenAIPrompt}
        />
      </div>
    </TwoPanelLayout>
  );
};

export default AISimulationPage;
