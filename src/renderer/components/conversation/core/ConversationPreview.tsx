import React, { useState, useEffect, useCallback } from 'react';
import { useConversationStore } from '../../../stores/conversationStore';
import { extractMessagesFromMapping } from '../../../services/conversation';
import { MessageList } from '../messages';
import type { ConversationData } from '../../../services/conversation';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
}

interface ConversationPreviewProps {
  conversationId: string;
  conversation: ConversationData;
  maxMessages?: number;
}

const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  conversationId,
  conversation,
  maxMessages = 6
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    getFullConversationDataById,
    loadFullConversationData,
    currentSourceFile
  } = useConversationStore();

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the source file path from the conversation or fall back to currentSourceFile
      const sourceFilePath = conversation.sourceFilePath || currentSourceFile;
      
      if (!sourceFilePath) {
        setError('No source file path available for this conversation');
        return;
      }
      
      // Check cache first
      const cacheKey = `conversation_preview_${conversationId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.timestamp && (Date.now() - cachedData.timestamp) < 24 * 60 * 60 * 1000) {
            setMessages(cachedData.messages.slice(0, maxMessages));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Invalid cache data, reloading...');
        }
      }
      
      // First try to get the full conversation data from the store
      let fullConversationData = getFullConversationDataById(conversationId);
      
      if (!fullConversationData) {
        // Load from file if not in store
        fullConversationData = await loadFullConversationData(conversationId, sourceFilePath);
      }
      
      if (fullConversationData) {
        // Extract messages using the service
        let allMessages: Message[] = [];
        if (fullConversationData.mapping) {
          allMessages = extractMessagesFromMapping(fullConversationData.mapping);
        } else if (fullConversationData.messages) {
          allMessages = fullConversationData.messages;
        }
        
        // Limit to maxMessages for preview
        const previewMessages = allMessages.slice(0, maxMessages);
        setMessages(previewMessages);
        
        // Cache the messages
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            messages: allMessages,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Failed to cache messages:', error);
        }
      } else {
        setError('Failed to load conversation data');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, conversation.sourceFilePath, currentSourceFile, maxMessages, getFullConversationDataById, loadFullConversationData]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  if (loading) {
    return (
      <div className="p-4 border-t border-border bg-gray-50">
        <div className="text-center text-sm text-gray-500">
          Loading conversation preview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-t border-border bg-red-50">
        <div className="text-center text-sm text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-4 border-t border-border bg-gray-50">
        <div className="text-center text-sm text-gray-500">
          No messages found in this conversation
        </div>
      </div>
    );
  }

  return (
    <div className="border-y border-border">
      <div className="px-4">
        <div className="max-h-64 overflow-y-auto">
          <MessageList
            messages={messages.map((msg, index) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.create_time,
              messageIndex: index
            }))}
            layout="single"
            messageVariant="bubble"
            showRole={false}
            showTimestamp={false}
            className="space-y-2"
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationPreview;
