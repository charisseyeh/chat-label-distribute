import React, { useMemo, useCallback } from 'react';
import { ListItem } from '../common';
import { useConversationStore } from '../../stores/conversationStore';
import ConversationPreview from '../conversation/core/ConversationPreview';
import type { ConversationData } from '../../services/conversation';

interface ConversationSelectorProps {
  conversations: ConversationData[];
  selectedConversations: string[];
  onConversationToggle: (conversationId: string) => void;
  showRelevancyChips?: boolean; // Optional prop to control relevancy chip display
  allowToggle?: boolean; // Optional prop to control whether conversations can be toggled
  onSelectAll?: () => void; // Optional prop for select all functionality
  onDeselectAll?: () => void; // Optional prop for deselect all functionality
  showSelectAllButtons?: boolean; // Optional prop to show/hide select all buttons
  maxHeight?: string; // Optional prop to set max height for scrollable container
}

const ConversationSelector: React.FC<ConversationSelectorProps> = ({
  conversations,
  selectedConversations,
  onConversationToggle,
  showRelevancyChips = true, // Default to true to maintain existing behavior
  allowToggle = false, // Default to false to maintain existing behavior
  onSelectAll,
  onDeselectAll,
  showSelectAllButtons = false, // Default to false to maintain existing behavior
  maxHeight = 'none' // Default to no max height
}) => {
  const { 
    selectedConversationIds: storeSelectedConversationIds,
    toggleConversationExpansion,
    isConversationExpanded
  } = useConversationStore();

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
      const isExpanded = isConversationExpanded(conversation.id);
      
      // Format the date properly
      const formattedDate = formatDate(conversation.createTime || conversation.createdAt);
      
      return (
        <div key={conversation.id}>
          <ListItem
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
            showChevron={true}
            chevronExpanded={isExpanded}
            onChevronClick={() => toggleConversationExpansion(conversation.id)}
          />
          {isExpanded && (
            <ConversationPreview
              conversationId={conversation.id}
              conversation={conversation}
              maxMessages={6}
            />
          )}
        </div>
      );
    });
  }, [conversations, selectedConversations, storeSelectedConversationIds, formatDate, handleConversationToggle, allowToggle, showRelevancyChips, isConversationExpanded, toggleConversationExpansion]);

  return (
    <div>

      {/* Scrollable Conversation List */}
      <div 
        className={maxHeight !== 'none' ? 'overflow-y-auto' : ''}
        style={{ maxHeight: maxHeight !== 'none' ? maxHeight : undefined }}
      >
        {conversationItems}

        {/* Select All / Deselect All Buttons */}
        {showSelectAllButtons && allowToggle && conversations.length > 0 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-200 sticky bottom-0 bg-background">
          <span className="text-body-secondary">
            {selectedConversations.length}/{conversations.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="btn-outline btn-sm"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="btn-outline btn-sm"
            >
              Deselect All
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ConversationSelector);
