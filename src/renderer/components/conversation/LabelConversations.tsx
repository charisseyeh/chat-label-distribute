import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';

const LabelConversations: React.FC = () => {
  const { selectedConversationIds } = useConversationStore();
  const { selectedConversations } = useNavigationStore();
  const navigate = useNavigate();

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleBackToSelection = () => {
    navigate('/select-conversations');
  };

  if (selectedConversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Label Conversations</h2>
          <p className="text-gray-600 mb-4">
            No conversations selected for labeling. Please go back to the conversation selection page.
          </p>
          <button
            onClick={handleBackToSelection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Conversations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Label Conversations</h2>
            <p className="text-gray-600">
              You have {selectedConversations.length} conversation(s) selected for labeling.
            </p>
          </div>
          <button
            onClick={handleBackToSelection}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {selectedConversations.map((conversation) => (
          <div 
            key={conversation.id} 
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleConversationClick(conversation.id)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {conversation.title || 'Untitled Conversation'}
            </h3>
            <div className="text-sm text-gray-600 mb-3">
              Conversation ID: {conversation.id}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-600 font-medium">
                Click to view and label this conversation
              </div>
              <div className="text-sm text-gray-500">
                → View Conversation
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelConversations;
