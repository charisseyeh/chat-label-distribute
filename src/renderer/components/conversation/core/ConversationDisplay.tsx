import React, { useEffect, useRef, useCallback } from 'react';
import MessageList from '../messages/MessageList';
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

const ConversationDisplay: React.FC<ConversationDisplayProps> = React.memo(({
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
  const lastMessageCountRef = useRef<number>(0);
  const previousDisplayedCountRef = useRef<number>(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Memoize callback functions to prevent infinite re-renders
  const handleTurn6Reached = useCallback(() => {
    console.log('🔄 Turn 6 reached in conversation display');
  }, []);

  const handleEndReached = useCallback(() => {
    console.log('🔄 End reached in conversation display');
  }, []);

  // Initialize message visibility tracking
  const { 
    startTracking, 
    stopTracking, 
    resetTracking,
    trackMessageVisibility,
    setMessageCount
  } = useScrollTracking({
    autoStart: false, // We'll start manually after messages are loaded
    onTurn6Reached: handleTurn6Reached,
    onEndReached: handleEndReached
  });

  // Start tracking when messages are loaded - only when messages.length changes
  useEffect(() => {
    if (messages.length > 0) {
      console.log('🎯 ConversationDisplay: Messages loaded, setting up message visibility tracking');
      console.log('🎯 ConversationDisplay: Total messages:', messages.length);
      
      // Set the message count for turn 6 detection
      setMessageCount(messages.length);
      
      // Start tracking
      startTracking();
      
      // Reset the previous displayed count
      previousDisplayedCountRef.current = 0;
      
      return () => {
        console.log('🔄 ConversationDisplay: Cleaning up message visibility tracking');
        stopTracking();
      };
    }
  }, [messages.length]); // Only depend on messages.length, not the functions

  // Reset tracking when messages change - but only if the count actually changes significantly
  useEffect(() => {
    if (messages.length > 0 && messages.length !== lastMessageCountRef.current) {
      console.log('🔄 Message count changed, resetting message visibility tracking');
      lastMessageCountRef.current = messages.length;
      resetTracking();
      setMessageCount(messages.length);
    }
  }, [messages.length]); // Only depend on messages.length, not the functions

  // Monitor actual scroll events on the messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Calculate which message should be visible based on scroll position
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      const estimatedMessageIndex = Math.floor(scrollPercentage * messages.length);
      
      // Clamp to valid range
      const messageIndex = Math.max(0, Math.min(estimatedMessageIndex, messages.length - 1));
      
      console.log(`🎯 Scroll event: position ${scrollTop}/${scrollHeight - clientHeight} (${Math.round(scrollPercentage * 100)}%), estimated message ${messageIndex + 1}/${messages.length}`);
      
      // Track message visibility based on actual scroll position
      trackMessageVisibility(messageIndex);
    };

    // Add scroll event listener
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set baseline
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [messages.length, trackMessageVisibility]);

  // Memoize the message list to prevent unnecessary re-renders
  const messageList = React.useMemo(() => (
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
  ), [displayedMessages]);

  // Memoize the lazy loading controls to prevent unnecessary re-renders
  const lazyLoadingControls = React.useMemo(() => {
    if (!hasMoreMessages) return null;
    
    return (
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
    );
  }, [hasMoreMessages, onLoadMore, onShowAll, totalMessageCount]);

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
    <div className="flex-1 overflow-y-auto p-6 pb-44 messages-container min-h-0" ref={messagesContainerRef}>
      {/* Debug info for message visibility tracking */}
      <div className="text-xs text-muted-foreground mb-2 sticky top-0 bg-background p-2 rounded z-10">
        Messages: {displayedMessages.length}/{totalMessageCount} | Tracking message visibility
      </div>

      {messageList}
      
      {lazyLoadingControls}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.displayedMessages.length === nextProps.displayedMessages.length &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.hasMoreMessages === nextProps.hasMoreMessages &&
    prevProps.totalMessageCount === nextProps.totalMessageCount
  );
});

export default ConversationDisplay;
