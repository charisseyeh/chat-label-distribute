import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  variant = 'minimal',
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
    // Sanitize content to prevent layout breaking
    const sanitizedContent = content
      .replace(/^#+/gm, '') // Remove markdown headers that might break layout
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
      .replace(/```[\s\S]*?```/g, (match) => {
        // Convert code blocks to plain text with proper line breaks
        return match.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
      });

    // Use ReactMarkdown for rich markdown rendering with error handling
    return (
      <div className="markdown-content prose prose-sm max-w-none break-words">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize code block styling
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono break-all" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto break-all" {...props}>
                  {children}
                </code>
              );
            },
            // Customize link styling
            a: ({ children, href, ...props }: any) => (
              <a 
                href={href} 
                className="text-blue-600 hover:text-blue-800 underline break-all" 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            ),
            // Customize blockquote styling
            blockquote: ({ children, ...props }: any) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 break-words" {...props}>
                {children}
              </blockquote>
            ),
            // Handle paragraphs to prevent overflow
            p: ({ children, ...props }: any) => (
              <p className="break-words overflow-wrap-anywhere" {...props}>
                {children}
              </p>
            ),
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    );
  };

  // Add data-message-index attribute for intersection observer tracking
  const messageAttributes: React.HTMLAttributes<HTMLDivElement> & { 'data-message-index'?: number } = {};
  if (messageIndex !== undefined) {
    messageAttributes['data-message-index'] = messageIndex;
  }

  if (variant === 'minimal') {
    return (
      <div className={`message-container ${className}`} {...messageAttributes}>
        <div className="message-content">
          {formatMessageContent(content)}
        </div>
      </div>
    );
  }

  if (variant === 'bubble') {
    const isUser = role === 'user';
    
    return (
      <div className={`message-container ${role} ${className}`} {...messageAttributes}>
        <div className={`message-content ${role}`}>
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
          <div className={`message-bubble ${role}`}>
            {formatMessageContent(content)}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`message-container ${className}`} {...messageAttributes}>
      <div className="message-content">
        {formatMessageContent(content)}
      </div>
    </div>
  );
};

export default Message;
