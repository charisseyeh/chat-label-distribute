import React from 'react';
import Message, { MessageProps } from './Message';

export interface MessageListProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  layout?: 'single' | 'two-column' | 'grid';
  columns?: number;
  className?: string;
  messageVariant?: 'default' | 'bubble' | 'minimal';
  showRole?: boolean;
  showTimestamp?: boolean;
  maxMessages?: number;
  onLoadMore?: () => void;
  hasMoreMessages?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  layout = 'single',
  columns = 2,
  className = '',
  messageVariant = 'bubble',
  showRole = true,
  showTimestamp = true,
  maxMessages,
  onLoadMore,
  hasMoreMessages = false,
}) => {
  const displayMessages = maxMessages ? messages.slice(0, maxMessages) : messages;

  const renderSingleColumn = () => (
    <div className="space-y-4">
      {displayMessages.map((message) => (
        <Message
          key={message.id}
          {...message}
          variant={messageVariant}
          showRole={showRole}
          showTimestamp={showTimestamp}
        />
      ))}
    </div>
  );

  const renderTwoColumn = () => {
    return (
      <div className="space-y-4">
        {displayMessages.map((message) => (
                      <Message
              key={message.id}
              {...message}
              variant={messageVariant}
              showRole={showRole}
              showTimestamp={showTimestamp}
            />
        ))}
      </div>
    );
  };

  const renderGrid = () => (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {displayMessages.map((message) => (
        <Message
          key={message.id}
          {...message}
          variant={messageVariant}
          showRole={showRole}
          showTimestamp={showTimestamp}
        />
      ))}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'two-column':
        return renderTwoColumn();
      case 'grid':
        return renderGrid();
      case 'single':
      default:
        return renderSingleColumn();
    }
  };

  return (
    <div className={className}>
      {renderLayout()}
      
      {/* Load More Button */}
      {hasMoreMessages && onLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Load More Messages
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
