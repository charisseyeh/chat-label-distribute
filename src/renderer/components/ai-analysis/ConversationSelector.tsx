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
    <div className="space-y-3">
      {conversations.map(conversation => (
        <div
          key={conversation.id}
          className={`p-3 border rounded-md cursor-pointer transition-colors ${
            selectedConversations.includes(conversation.id)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onConversationToggle(conversation.id)}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={selectedConversations.includes(conversation.id)}
              onChange={() => onConversationToggle(conversation.id)}
              className="text-blue-600"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate text-sm">{conversation.title}</h3>
              <p className="text-xs text-gray-500">
                {conversation.data.responses.length} responses
              </p>
            </div>
          </div>
        </div>
      ))}
      {conversations.length === 0 && (
        <p className="text-gray-500 text-center py-4 text-sm">
          No conversations with survey responses found. Please complete surveys in conversations first.
        </p>
      )}
    </div>
  );
};

export default ConversationSelector;
