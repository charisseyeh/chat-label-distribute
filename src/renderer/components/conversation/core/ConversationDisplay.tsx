import React from 'react';
import { MessageList } from '../messages';
import { Message } from '../../../services/conversation/messageProcessingService';

interface ConversationDisplayProps {
  messages: Message[];
  displayedMessages: Message[];
  loading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  totalMessageCount: number;
  onLoadMore: () => void;
  onShowAll: () => void;
  onRetry: () => void;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
  displayedMessages,
  loading,
  error,
  hasMoreMessages,
  totalMessageCount,
  onLoadMore,
  onShowAll,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">{error}</div>
        <button 
          onClick={onRetry}
          className="btn-primary ml-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {!Array.isArray(messages) ? 'Error: Messages not loaded properly' : 'No messages found in this conversation'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-44 messages-container min-h-0">
      <MessageList
        messages={displayedMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.create_time
        }))}
        layout="two-column"
        messageVariant="bubble"
        showRole={false}
        showTimestamp={false}
      />
      
      {/* Lazy Loading Controls */}
      {hasMoreMessages && (
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={onLoadMore}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Load More Messages (+50)
            </button>
            <button
              onClick={onShowAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Show All Messages ({totalMessageCount})
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading messages in batches for better performance
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;
