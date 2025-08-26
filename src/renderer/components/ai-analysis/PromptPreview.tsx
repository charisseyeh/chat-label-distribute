import React from 'react';

interface PromptPreviewProps {
  currentTemplate: any;
  selectedConversations: string[];
  storeConversations: any[];
  generateOpenAIPrompt: (context: string, position: any) => string | null;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({
  currentTemplate,
  selectedConversations,
  storeConversations,
  generateOpenAIPrompt
}) => {
  if (!currentTemplate || selectedConversations.length === 0) return null;

  // Use the first selected conversation for preview
  const firstConversation = storeConversations.find(c => c.id === selectedConversations[0]);
  if (!firstConversation) return null;

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        <strong>Current prompt:</strong> Using the '{currentTemplate.name}' template
      </div>
      
      <button 
        className="w-full px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition-colors"
        onClick={() => {
          // This could open a modal with full prompt preview
          const prompt = generateOpenAIPrompt(`Conversation: ${firstConversation.title}`, 'beginning');
          if (prompt) {
            console.log('Full prompt:', prompt);
            // You could show this in a modal or tooltip
          }
        }}
      >
        Review prompt
      </button>
      
      <div className="text-xs text-gray-500">
        Prompt analyzes conversation context and generates ratings based on the survey template.
      </div>
    </div>
  );
};

export default PromptPreview;
