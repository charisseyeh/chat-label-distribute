import React from 'react';
import ConversationSelector from './ConversationSelector';
import AIConfigurationPanel from './AIConfigurationPanel';
import PromptPreview from './PromptPreview';
import { SurveyTemplate } from '../../types/survey';

interface AIComparisonSidebarProps {
  conversationsWithData: Array<{
    id: string;
    title: string;
    data: any;
    hasResponses: boolean;
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
  generateOpenAIPrompt
}) => {
  return (
    <div className="space-y-6 border-l border-gray-200 h-full">
      {/* Chat Selection */}
      <div>
        <ConversationSelector
          conversations={conversationsWithData}
          selectedConversations={selectedConversationIds}
          onConversationToggle={onConversationToggle}
        />
      </div>

      {/* AI Configuration */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="pb-1">AI Comparison</h3>
        <p className="text-muted-foreground pb-3">
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
        />
      </div>

      {/* Prompt Preview */}
      <div>
        <PromptPreview
          currentTemplate={currentTemplate}
          selectedConversations={selectedConversationIds}
          storeConversations={storeConversations}
          generateOpenAIPrompt={generateOpenAIPrompt}
        />
      </div>
    </div>
  );
};

export default AIComparisonSidebar;
