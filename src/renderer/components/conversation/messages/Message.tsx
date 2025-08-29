import React from 'react';

export interface MessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  className?: string;
  variant?: 'default' | 'bubble' | 'minimal';
  showRole?: boolean;
  showTimestamp?: boolean;
  messageIndex?: number; // Add messageIndex for tracking
}

const Message: React.FC<MessageProps> = ({
  id,
  role,
  content,
  timestamp,
  className = '',
  variant = 'bubble',
  showRole = false,
  showTimestamp = false,
  messageIndex,
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assistant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user':
        return 'User';
      case 'assistant':
        return 'AI Assistant';
      case 'system':
        return 'System';
      default:
        return role;
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple formatting - can be enhanced with markdown support
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Add data-message-index attribute for intersection observer tracking
  const messageAttributes: React.HTMLAttributes<HTMLDivElement> = {};
  if (messageIndex !== undefined) {
    messageAttributes['data-message-index'] = messageIndex;
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex space-x-3 ${className}`} {...messageAttributes}>
        <div className="flex-1">
          <div className="prose prose-sm max-w-none">
            {formatMessageContent(content)}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'bubble') {
    const isUser = role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`} {...messageAttributes}>
        <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
          {/* Role and Timestamp Header */}
          {(showRole || showTimestamp) && (
            <div className={`flex items-center space-x-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {showRole && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                  {getRoleDisplayName(role)}
                </span>
              )}
              {showTimestamp && (
                <span className="text-xs text-muted-foreground">
                  {new Date(timestamp * 1000).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          
          {/* Message Bubble */}
          <div className={`message-bubble ${role} ${isUser ? 'ml-auto' : 'mr-auto'}`}>
            <div className="prose prose-sm max-w-none">
              {formatMessageContent(content)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex space-x-3 ${className}`} {...messageAttributes}>
      <div className="flex-1">
        <div className="prose prose-sm max-w-none">
          {formatMessageContent(content)}
        </div>
      </div>
    </div>
  );
};

export default Message;
