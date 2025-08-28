import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { useSurveyQuestionStore } from '../stores/surveyQuestionStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAIPrompt } from '../hooks/ai/useAIPrompt';
import { TwoPanelLayout } from '../components/common';
import { 
  ProgressTracker, 
  AIComparisonSidebar, 
  ComparisonResultsDisplay 
} from '../components/ai-analysis';
import { useAIGeneration } from '../hooks/ai/useAIGeneration';
import { useConversationSelection } from '../hooks/conversation/useConversationSelection';
import { useAIConfiguration } from '../hooks/ai/useAIConfiguration';

const AIComparisonsPage: React.FC = () => {
  const { getConversationData } = useSurveyResponseStore();
  const { currentTemplate } = useSurveyQuestionStore();
  const { selectedConversations: storeConversations } = useConversationStore();
  const { generateOpenAIPrompt } = useAIPrompt();

  // Custom hooks for different concerns
  const {
    selectedConversationIds,
    conversationsWithData,
    toggleConversationSelection
  } = useConversationSelection();

  const {
    apiKey,
    model,
    setApiKey,
    setModel
  } = useAIConfiguration();

  const {
    comparisonData,
    trialComparisons,
    isGenerating,
    generationProgress,
    generateAIResponses
  } = useAIGeneration();

  // Handle AI generation with error handling
  const handleGenerateAI = async () => {
    try {
      await generateAIResponses(
        selectedConversationIds,
        apiKey,
        model,
        getConversationData
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

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
          onGenerate={handleGenerateAI}
          isGenerating={isGenerating}
          hasSelectedConversations={selectedConversationIds.length > 0}
          currentTemplate={currentTemplate}
          storeConversations={storeConversations}
          generateOpenAIPrompt={generateOpenAIPrompt}
        />
      }
    >
      {/* Main Content Area - AI Comparison Results */}
      <div className="space-y-6">
        {/* Progress and Status Display */}
        {isGenerating && (
          <ProgressTracker
            progress={generationProgress}
            storeConversations={storeConversations}
            selectedConversations={selectedConversationIds}
          />
        )}

        {/* AI Comparison Results */}
        <ComparisonResultsDisplay
          comparisonData={comparisonData}
          trialComparisons={trialComparisons}
          currentTemplate={currentTemplate}
          model={model}
        />
      </div>
    </TwoPanelLayout>
  );
};

export default AIComparisonsPage;
