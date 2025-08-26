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

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-lg font-medium text-blue-900 mb-3">AI System Prompt Preview</h3>
      <p className="text-sm text-blue-700 mb-4">
        These are the exact prompts that will be sent to OpenAI for each position. The AI will use these instructions to generate ratings based on the survey template above.
      </p>
      <div className="space-y-4">
        {['beginning', 'turn6', 'end'].map((position) => {
          // Use the first selected conversation for preview
          const firstConversation = storeConversations.find(c => c.id === selectedConversations[0]);
          if (!firstConversation) return null;
          
          const conversationContext = `Conversation: ${firstConversation.title}`;
          const prompt = generateOpenAIPrompt(conversationContext, position as any);
          return prompt ? (
            <div key={position} className="p-3 bg-white border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2 capitalize">
                {position === 'turn6' ? 'Turn 6' : position} Position Prompt
              </h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md text-sm font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap">{prompt}</pre>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Context:</strong> {conversationContext}
              </p>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default PromptPreview;
