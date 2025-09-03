import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAssessmentResponseStore } from '../stores/assessmentResponseStore';
import { useAssessmentQuestionStore } from '../stores/assessmentQuestionStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAIPrompt } from '../hooks/ai/useAIPrompt';
import { TwoPanelLayout } from '../components/common';
import { 
  ProgressTracker, 
  AIComparisonSidebar, 
  ComparisonResultsDisplay,
  PromptReviewModal,
  ExportComparisonModal
} from '../components/ai-analysis';
import { useAIGeneration } from '../hooks/ai/useAIGeneration';
import { useConversationSelection } from '../hooks/conversation/useConversationSelection';
import { useAIConfiguration } from '../hooks/ai/useAIConfiguration';
import { useNavigationStore } from '../stores/navigationStore';
import { useAIComparisonStore } from '../stores/aiComparisonStore';

const AIComparisonsPage: React.FC = () => {
  const { getConversationData } = useAssessmentResponseStore();
  const { currentTemplate } = useAssessmentQuestionStore();
  const { selectedConversations: storeConversations } = useConversationStore();
  const { generateOpenAIPrompt, generateSystemPromptOnly, generateOpenAIPromptWithCustomSystem } = useAIPrompt();
  const { batchUpdate } = useNavigationStore();
  const { setExportHandler, setHasComparisonData, clearExportHandler } = useAIComparisonStore();
  const location = useLocation();

  // Prompt review modal state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Navigation sync effect
  useEffect(() => {
    batchUpdate({
      currentPage: 'ai-comparisons',
      currentConversationId: null,
      currentTemplateId: null
    });
  }, [batchUpdate]);

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
    generateAIResponses,
    accuracy
  } = useAIGeneration();

  // Handle prompt review modal
  const handleReviewPrompt = () => {
    if (selectedConversationIds.length === 0) {
      alert('Please select at least one conversation to review the prompt.');
      return;
    }

    const systemPrompt = generateSystemPromptOnly();
    
    if (systemPrompt) {
      setCurrentPrompt(systemPrompt);
      // Initialize custom system prompt if not already set
      if (!customSystemPrompt) {
        setCustomSystemPrompt(systemPrompt);
      }
      setIsPromptModalOpen(true);
    } else {
      alert('Failed to generate system prompt. Please check your assessment template.');
    }
  };



  // Handle saving edited prompt
  const handleSavePrompt = (editedPrompt: string) => {
    setCurrentPrompt(editedPrompt);
    setCustomSystemPrompt(editedPrompt);
    console.log('Saved edited system prompt:', editedPrompt);
  };

  // Handle export modal
  const handleExportComparison = () => {
    setIsExportModalOpen(true);
  };

  // Handle AI generation with error handling
  const handleGenerateAI = async () => {
    try {
      await generateAIResponses(
        selectedConversationIds,
        apiKey,
        model,
        getConversationData,
        customSystemPrompt || undefined
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Register export handler and update comparison data state
  useEffect(() => {
    setExportHandler(handleExportComparison);
    setHasComparisonData(comparisonData.length > 0);
    
    // Cleanup on unmount
    return () => {
      clearExportHandler();
    };
  }, [comparisonData.length, setExportHandler, setHasComparisonData, clearExportHandler]);

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
          onReviewPrompt={handleReviewPrompt}
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

        {/* AI Comparison Results - only show when not generating */}
        {!isGenerating && (
          <ComparisonResultsDisplay
            comparisonData={comparisonData}
            trialComparisons={trialComparisons}
            currentTemplate={currentTemplate}
            model={model}
          />
        )}
      </div>

      {/* Prompt Review Modal */}
      <PromptReviewModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        currentPrompt={currentPrompt}
        onSavePrompt={handleSavePrompt}
      />

      {/* Export Modal */}
      <ExportComparisonModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        comparisonData={comparisonData}
        trialComparisons={trialComparisons}
        currentTemplate={currentTemplate}
        model={model}
        accuracy={accuracy}
      />
    </TwoPanelLayout>
  );
};

export default AIComparisonsPage;
