import React from 'react';
import ConversationSelector from './ConversationSelector';
import AIConfigurationPanel from './AIConfigurationPanel';
import { SurveyTemplate } from '../../types/survey';

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
  return (
    <aside className="h-full">
      {/* Chat Selection */}
      <section>
        <ConversationSelector
          conversations={conversationsWithData}
          selectedConversations={selectedConversationIds}
          onConversationToggle={onConversationToggle}
          showRelevancyChips={false}
          allowToggle={true}
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
