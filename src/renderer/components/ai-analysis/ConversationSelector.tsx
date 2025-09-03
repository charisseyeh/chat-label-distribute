import React, { useMemo, useCallback } from 'react';
import { ListItem } from '../common';
import { useConversationStore } from '../../stores/conversationStore';
import type { ConversationData } from '../../services/conversation';

interface ConversationSelectorProps {
  conversations: ConversationData[];
  selectedConversations: string[];
  onConversationToggle: (conversationId: string) => void;
  showRelevancyChips?: boolean; // Optional prop to control relevancy chip display
  allowToggle?: boolean; // Optional prop to control whether conversations can be toggled
}

const ConversationSelector: React.FC<ConversationSelectorProps> = ({
  conversations,
  selectedConversations,
  onConversationToggle,
  showRelevancyChips = true, // Default to true to maintain existing behavior
  allowToggle = false // Default to false to maintain existing behavior
}) => {
  const { selectedConversationIds: storeSelectedConversationIds } = useConversationStore();

  const formatDate = useCallback((timestamp: number | string | undefined) => {
    if (!timestamp) return 'No date';
    
    try {
      let date: Date;
      
      if (typeof timestamp === 'number') {
        // If it's a Unix timestamp (seconds), convert to milliseconds
        // Check if it's likely seconds (before year 2100) or milliseconds
        if (timestamp < 10000000000) {
          date = new Date(timestamp * 1000);
        } else {
          date = new Date(timestamp);
        }
      } else {
        date = new Date(timestamp);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }, []);

  const handleConversationToggle = useCallback((conversationId: string) => {
    onConversationToggle(conversationId);
  }, [onConversationToggle]);

  const conversationItems = useMemo(() => {
    // Use the appropriate selectedConversationIds based on context
    const currentSelectedIds = allowToggle ? selectedConversations : storeSelectedConversationIds;
    
    return conversations.map(conversation => {
      const isPermanentlyStored = !allowToggle && selectedConversations.includes(conversation.id);
      const isCurrentlySelected = currentSelectedIds.includes(conversation.id);
      
      // Format the date properly
      const formattedDate = formatDate(conversation.createTime || conversation.createdAt);
      
      return (
        <ListItem
          key={conversation.id}
          variant="check-single"
          title={conversation.title || 'Untitled Conversation'}
          metadata={isPermanentlyStored 
            ? 'Selected for labeling'
            : formattedDate}
          chip={isPermanentlyStored 
            ? undefined
            : showRelevancyChips && conversation.aiRelevancy ? {
                variant: conversation.aiRelevancy.category === 'relevant' ? 'relevant' : 'not-relevant',
                text: conversation.aiRelevancy.category === 'relevant' ? '✓ Relevant' : '✗ Not Relevant'
              } : undefined}
          checked={allowToggle ? isCurrentlySelected : (isPermanentlyStored || isCurrentlySelected)}
          onCheckChange={allowToggle ? () => handleConversationToggle(conversation.id) : (isPermanentlyStored ? undefined : () => handleConversationToggle(conversation.id))}
          selected={allowToggle ? isCurrentlySelected : (isPermanentlyStored || isCurrentlySelected)}
          onClick={allowToggle ? () => handleConversationToggle(conversation.id) : (isPermanentlyStored ? undefined : () => handleConversationToggle(conversation.id))}
          className="hover:border-gray-300 transition-colors"
        />
      );
    });
  }, [conversations, selectedConversations, storeSelectedConversationIds, formatDate, handleConversationToggle, allowToggle, showRelevancyChips]);

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
