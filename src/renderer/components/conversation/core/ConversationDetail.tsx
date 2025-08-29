import React from 'react';
import { useConversationDetail } from '../../../hooks/conversation/useConversationDetail';
import ConversationDisplay from './ConversationDisplay';

interface ConversationDetailProps {
  onTurn6Reached?: () => void;
  onEndReached?: () => void;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ 
  onTurn6Reached, 
  onEndReached 
}) => {
  const {
    messages,
    displayedMessages,
    loading,
    error,
    hasMoreMessages,
    totalMessageCount,
    handleRefreshMessages,
    loadMoreMessages,
    showAllMessagesHandler
  } = useConversationDetail();

  const handleLoadMore = loadMoreMessages;
  const handleShowAll = showAllMessagesHandler;
  const handleRetry = handleRefreshMessages;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ConversationDisplay
        messages={messages}
        displayedMessages={displayedMessages}
        loading={loading}
        error={error}
        hasMoreMessages={hasMoreMessages}
        totalMessageCount={totalMessageCount}
        onLoadMore={handleLoadMore}
        onShowAll={handleShowAll}
        onRetry={handleRetry}
        onTurn6Reached={onTurn6Reached}
        onEndReached={onEndReached}
      />
    </div>
  );
};

export default ConversationDetail;
