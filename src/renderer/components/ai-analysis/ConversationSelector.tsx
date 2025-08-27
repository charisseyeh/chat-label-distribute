import React from 'react';
import { ListItem } from '../common/molecules/ListItem';

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
    <div>
      {conversations.map(conversation => (
        <ListItem
          key={conversation.id}
          variant="check-single"
          title={conversation.title}
          metadata={`${conversation.data.responses.length} responses`}
          checked={selectedConversations.includes(conversation.id)}
          onCheckChange={() => onConversationToggle(conversation.id)}
          onClick={() => onConversationToggle(conversation.id)}
          className="hover:border-gray-300 transition-colors"
        />
      ))}
      {conversations.length === 0 && (
        <p className="text-gray-500 text-left py-4 text-sm">
          No conversations with survey responses found. Please complete surveys in conversations first.
        </p>
      )}
    </div>
  );
};

export default ConversationSelector;
