import React, { useEffect, useRef } from 'react';
import { MessageList } from '../messages';
import { Message } from '../../../services/conversation/messageProcessingService';
import { useScrollTracking } from '../../../hooks/core/useScrollTracking';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize scroll tracking with the scroll element reference
  const { 
    startTracking, 
    stopTracking, 
    resetTracking,
    trackMessageVisibility,
    scrollPercentage,
    setScrollElement
  } = useScrollTracking({
    autoStart: false, // We'll start manually after DOM is ready
    scrollElement: scrollContainerRef.current, // Pass the scroll element reference
    onTurn6Reached: () => {
      console.log('🔄 Turn 6 reached in conversation display');
    },
    onEndReached: () => {
      console.log('🔄 End reached in conversation display');
    }
  });

  // Start scroll tracking when component mounts and messages are loaded
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      console.log('🎯 ConversationDisplay: Messages loaded, setting up scroll tracking');
      console.log('🎯 ConversationDisplay: Scroll container:', scrollContainerRef.current);
      console.log('🎯 ConversationDisplay: Container scrollable:', scrollContainerRef.current.scrollHeight > scrollContainerRef.current.clientHeight);
      
      // Set the scroll element in the tracker
      setScrollElement(scrollContainerRef.current);
      
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log('🔄 Starting scroll tracking for conversation display');
        startTracking();
      }, 100);

      return () => {
        clearTimeout(timer);
        stopTracking();
      };
    }
  }, [messages.length, startTracking, stopTracking, setScrollElement]);

  // Reset tracking when messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log('🔄 Resetting scroll tracking for new messages');
      resetTracking();
    }
  }, [messages.length, resetTracking]);

  // Track message visibility as user scrolls
  useEffect(() => {
    if (displayedMessages.length > 0) {
      // Track the last visible message
      const lastVisibleIndex = displayedMessages.length - 1;
      trackMessageVisibility(lastVisibleIndex);
    }
  }, [displayedMessages.length, trackMessageVisibility]);

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
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-6 pb-44 messages-container min-h-0"
    >
      {/* Debug info for scroll tracking */}
      <div className="text-xs text-muted-foreground mb-2 sticky top-0 bg-background p-2 rounded">
        Scroll: {Math.round(scrollPercentage)}% | Messages: {displayedMessages.length}/{totalMessageCount}
      </div>

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
