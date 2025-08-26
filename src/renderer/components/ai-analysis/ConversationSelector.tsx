import React from 'react';

interface ConversationWithData {
  id: string;
  title: string;
  data: any;
  hasResponses: boolean;
}

interface ConversationSelectorProps {
  conversations: ConversationWithData[];
  selectedConversations: string[];
  onConversationToggle: (conversationId: string) => void;
}

const ConversationSelector: React.FC<ConversationSelectorProps> = ({
  conversations,
  selectedConversations,
  onConversationToggle
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Conversations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map(conversation => (
          <div
            key={conversation.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedConversations.includes(conversation.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onConversationToggle(conversation.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 truncate">{conversation.title}</h3>
                <p className="text-sm text-gray-500">
                  {conversation.data.responses.length} responses
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedConversations.includes(conversation.id)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedConversations.includes(conversation.id) && (
                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {conversations.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No conversations with survey responses found. Please complete surveys in conversations first.
        </p>
      )}
    </div>
  );
};

export default ConversationSelector;
