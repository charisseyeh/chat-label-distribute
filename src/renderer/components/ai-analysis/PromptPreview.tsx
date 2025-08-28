import React, { useState } from 'react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  if (!currentTemplate || selectedConversations.length === 0) return null;

  // Use the first selected conversation for preview
  const firstConversation = storeConversations.find(c => c.id === selectedConversations[0]);
  if (!firstConversation) return null;

  const handleShowPrompt = () => {
    const prompt = generateOpenAIPrompt(`Conversation: ${firstConversation.title}`, 'beginning');
    if (prompt) {
      setCurrentPrompt(prompt);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Prompt Preview</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {currentPrompt}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptPreview;
