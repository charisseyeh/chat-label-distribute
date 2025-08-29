import React, { useMemo, useCallback } from 'react';
import { ListItem } from '../common';
import { useConversationStore } from '../../stores/conversationStore';
import type { ConversationData } from '../../services/conversation';

interface ConversationSelectorProps {
  conversations: ConversationData[];
  selectedConversations: string[];
  onConversationToggle: (conversationId: string) => void;
}

const ConversationSelector: React.FC<ConversationSelectorProps> = ({
  conversations,
  selectedConversations,
  onConversationToggle
}) => {
  const { selectedConversationIds } = useConversationStore();

  const formatDate = useCallback((timestamp: number | string | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  const handleConversationToggle = useCallback((conversationId: string) => {
    onConversationToggle(conversationId);
  }, [onConversationToggle]);

  const conversationItems = useMemo(() => {
    return conversations.map(conversation => {
      const isPermanentlyStored = selectedConversations.includes(conversation.id);
      const isCurrentlySelected = selectedConversationIds.includes(conversation.id);
      
      return (
        <ListItem
          key={conversation.id}
          variant="check-single"
          title={conversation.title || 'Untitled Conversation'}
          metadata={isPermanentlyStored 
            ? 'Selected for labeling'
            : `${formatDate(conversation.createTime || conversation.createdAt || Date.now())}${conversation.modelVersion ? ` • ${conversation.modelVersion}` : ''}`}
          chip={isPermanentlyStored 
            ? undefined
            : conversation.aiRelevancy ? {
                variant: conversation.aiRelevancy.category === 'relevant' ? 'relevant' : 'not-relevant',
                text: conversation.aiRelevancy.category === 'relevant' ? '✓ Relevant' : '✗ Not Relevant'
              } : undefined}
          checked={isPermanentlyStored || isCurrentlySelected}
          onCheckChange={isPermanentlyStored ? undefined : () => handleConversationToggle(conversation.id)}
          selected={isPermanentlyStored || isCurrentlySelected}
          onClick={isPermanentlyStored ? undefined : () => handleConversationToggle(conversation.id)}
          className="hover:border-gray-300 transition-colors"
        />
      );
    });
  }, [conversations, selectedConversations, selectedConversationIds, formatDate, handleConversationToggle]);

  return (
    <div>
      {conversationItems}
      {conversations.length === 0 && (
        <p className="text-body-secondary text-left p-4">
          No conversations meet the current filtering criteria. Try adjusting your filters or date range.
        </p>
      )}
    </div>
  );
};

export default React.memo(ConversationSelector);
