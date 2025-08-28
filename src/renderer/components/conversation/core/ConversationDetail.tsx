import React from 'react';
import { useConversationDetail } from '../../../hooks/conversation/useConversationDetail';
import ConversationDisplay from './ConversationDisplay';

const ConversationDetail: React.FC = () => {
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

  return (
    <ConversationDisplay
      messages={messages}
      displayedMessages={displayedMessages}
      loading={loading}
      error={error}
      hasMoreMessages={hasMoreMessages}
      totalMessageCount={totalMessageCount}
      onLoadMore={loadMoreMessages}
      onShowAll={showAllMessagesHandler}
      onRetry={handleRefreshMessages}
    />
  );
};

export default ConversationDetail;
