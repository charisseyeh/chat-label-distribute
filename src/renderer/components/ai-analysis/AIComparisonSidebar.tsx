import React, { useCallback, useMemo } from 'react';
import ConversationSelector from './ConversationSelector';
import AIConfigurationPanel from './AIConfigurationPanel';
import { SurveyTemplate } from '../../types/survey';
import { useAIComparisonStore } from '../../stores/aiComparisonStore';

interface AIComparisonSidebarProps {
  conversationsWithData: Array<{
    id: string;
    title: string;
    data: any;
    hasResponses: boolean;
    messageCount: number; // Add this required property
  }>;
  selectedConversationIds: string[];
  onConversationToggle: (conversationId: string) => void;
  apiKey: string;
  model: string;
  onApiKeyChange: (apiKey: string) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasSelectedConversations: boolean;
  currentTemplate: SurveyTemplate | null;
  storeConversations: any[];
  generateOpenAIPrompt: (context: string, position: 'beginning' | 'turn6' | 'end') => string | null;
  onReviewPrompt: () => void;
}

export const AIComparisonSidebar: React.FC<AIComparisonSidebarProps> = ({
  conversationsWithData,
  selectedConversationIds,
  onConversationToggle,
  apiKey,
  model,
  onApiKeyChange,
  onModelChange,
  onGenerate,
  isGenerating,
  hasSelectedConversations,
  currentTemplate,
  storeConversations,
  generateOpenAIPrompt,
  onReviewPrompt
}) => {
  const { hasComparisonData } = useAIComparisonStore();

  // Calculate max height accounting for footer
  const maxHeight = useMemo(() => {
    // Base calculation: viewport height minus header, padding, and AI config section
    // Footer height is approximately 64px (py-4 = 16px top + 16px bottom + content height)
    const footerHeight = hasComparisonData ? 64 : 0; // Only show footer when there's comparison data
    return `calc(100vh - 400px - ${footerHeight}px)`;
  }, [hasComparisonData]);

  // Select all conversations
  const handleSelectAll = useCallback(() => {
    conversationsWithData.forEach(conversation => {
      if (!selectedConversationIds.includes(conversation.id)) {
        onConversationToggle(conversation.id);
      }
    });
  }, [conversationsWithData, selectedConversationIds, onConversationToggle]);

  // Deselect all conversations
  const handleDeselectAll = useCallback(() => {
    selectedConversationIds.forEach(conversationId => {
      onConversationToggle(conversationId);
    });
  }, [selectedConversationIds, onConversationToggle]);
  return (
    <aside className="h-full">
      {/* Chat Selection */}
      <section className="flex-1 flex flex-col min-h-0">
        <ConversationSelector
          conversations={conversationsWithData}
          selectedConversations={selectedConversationIds}
          onConversationToggle={onConversationToggle}
          showRelevancyChips={false}
          allowToggle={true}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          showSelectAllButtons={true}
          maxHeight={maxHeight}
        />
      </section>

      {/* AI Configuration */}
      <section className="pl-4 pr-4 pt-4 border-t border-gray-200">
        <h3 className="text-h3 pb-1">AI Comparison</h3>
        <p className="text-body-secondary pb-3">
          Add your API key and model to compare conversations
        </p>
        <AIConfigurationPanel
          apiKey={apiKey}
          model={model}
          onApiKeyChange={onApiKeyChange}
          onModelChange={onModelChange}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          hasSelectedConversations={hasSelectedConversations}
          currentTemplate={currentTemplate}
          onReviewPrompt={onReviewPrompt}
        />
      </section>
    </aside>
  );
};

export default AIComparisonSidebar;
