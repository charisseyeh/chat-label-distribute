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
  // Add these new props to connect scroll tracking to parent
  onTurn6Reached?: () => void;
  onEndReached?: () => void;
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
  onRetry,
  onTurn6Reached,  // Add this
  onEndReached     // Add this
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Memoize callback functions to prevent infinite re-renders
  const handleTurn6Reached = useCallback(() => {
    console.log('🔄 Turn 6 reached in conversation display');
    onTurn6Reached?.(); // Call parent callback
  }, [onTurn6Reached]);

  const handleEndReached = useCallback(() => {
    console.log('🔄 End reached in conversation display');
    onEndReached?.(); // Call parent callback
  }, [onEndReached]);

  // Initialize message visibility tracking with intersection observer
  const { 
    startTracking, 
    stopTracking, 
    resetTracking,
    setupIntersectionObserver,
    setMessageCount,
    setInitialVisibleMessages,
    visibleMessages,
    isTracking
  } = useScrollTracking({
    autoStart: false, // We'll start manually after messages are loaded
    onTurn6Reached: handleTurn6Reached,
    onEndReached: handleEndReached,
    intersectionThreshold: 0.1 // 10% of message needs to be visible
  });

  // Start tracking when messages are loaded - only when messages.length changes
  useEffect(() => {
    if (messages.length > 0) {
      // Set the message count for turn 6 detection
      setMessageCount(messages.length);
      
      // Start tracking
      startTracking();
      
      return () => {
        stopTracking();
      };
    }
  }, [messages.length, startTracking, stopTracking, setMessageCount]);

  // Set up intersection observer when messages container is ready
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0 || !isTracking) return;

    // Find the actual scrollable container - it's the TwoPanelLayout's main content div
    let scrollableContainer: HTMLElement = container;
    let parent: HTMLElement | null = container.parentElement;
    
    // Walk up the DOM tree to find the scrollable container
    while (parent && parent !== document.body) {
      const computedStyle = window.getComputedStyle(parent);
      const overflowY = computedStyle.overflowY;
      
      // Check if this parent is scrollable
      if (overflowY === 'auto' || overflowY === 'scroll') {
        if (parent.scrollHeight > parent.clientHeight) {
          scrollableContainer = parent;
          break;
        }
      }
      
      parent = parent.parentElement;
    }
    
    // Set up intersection observer for all message elements
    setupIntersectionObserver(container, scrollableContainer);
    
    // Set up scroll listener on the actual scrollable container
    let hasUserScrolled = false;
    const handleScroll = () => {
      if (!hasUserScrolled) {
        hasUserScrolled = true;
      }
    };
    
    // Add scroll listener to the scrollable container
    scrollableContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also set up a window scroll listener as backup
    const handleWindowScroll = () => {
      if (!hasUserScrolled) {
        hasUserScrolled = true;
      }
    };
    
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    
    // After a short delay, determine which messages are initially visible
    // This helps establish the baseline before any scrolling occurs
    const initialVisibilityTimer = setTimeout(() => {
      const messageElements = container.querySelectorAll('[data-message-index]');
      const initiallyVisible: number[] = [];
      
      // Get the scrollable container's current scroll position and dimensions
      const scrollTop = scrollableContainer.scrollTop;
      const clientHeight = scrollableContainer.clientHeight;
      const scrollHeight = scrollableContainer.scrollHeight;
      
      // Use a reasonable viewport height for initial visibility calculation
      // This prevents counting all messages as visible if the container is very tall
      const effectiveViewportHeight = Math.min(clientHeight, 800); // Max 800px for initial visibility
      
      messageElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const messageIndex = parseInt(element.getAttribute('data-message-index') || '0', 10);
        
        // Calculate the element's position relative to the scrollable container
        const elementTop = rect.top - scrollableContainer.getBoundingClientRect().top + scrollTop;
        const elementBottom = elementTop + rect.height;
        
        // A message is initially visible if it's within the effective viewport
        // This prevents counting all messages as visible on very tall containers
        const isVisible = (
          elementTop < effectiveViewportHeight && // Top of message is above effective viewport
          elementBottom > 0 && // Bottom of message is below top of viewport
          rect.height > 0 // Message has actual height
        );
        
        if (isVisible) {
          initiallyVisible.push(messageIndex);
        }
      });
      
      // Set the initial visible messages (these won't trigger turn 6 until user scrolls)
      setInitialVisibleMessages(initiallyVisible);
    }, 100);
    
    // Also set up a mutation observer to watch for new messages being added
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldReSetup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if new message elements were added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                (node as Element).hasAttribute('data-message-index')) {
              shouldReSetup = true;
            }
          });
        }
      });
      
      if (shouldReSetup) {
        setupIntersectionObserver(container, scrollableContainer);
      }
    });
    
    mutationObserver.observe(container, {
      childList: true,
      subtree: true
    });
    
    return () => {
      clearTimeout(initialVisibilityTimer);
      mutationObserver.disconnect();
      scrollableContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [messages.length, isTracking, setupIntersectionObserver, setInitialVisibleMessages]);

  // Debug function to test message visibility tracking
  const testMessageVisibility = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      // Debug logging removed for production
    }
  }, [visibleMessages]);

  // Memoize the message list to prevent unnecessary re-renders
  const messageList = React.useMemo(() => (
    <MessageList
      messages={displayedMessages.map((msg, index) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.create_time,
        messageIndex: index // Pass message index for tracking
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
      {messageList}
      
      {lazyLoadingControls}
    </div>
  );
}, (prevProps, nextProps) => {
  // Update the comparison function to include new props
  return (
    prevProps.messages.length === nextProps.messages.length &&
    prevProps.displayedMessages.length === nextProps.displayedMessages.length &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.hasMoreMessages === nextProps.hasMoreMessages &&
    prevProps.totalMessageCount === nextProps.totalMessageCount &&
    prevProps.onTurn6Reached === nextProps.onTurn6Reached &&
    prevProps.onEndReached === nextProps.onEndReached
  );
});

export default ConversationDisplay;
