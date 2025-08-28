import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { extractMessagesFromMapping } from '../../services/conversation';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
}

export const useConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getConversationById,
    currentSourceFile,
    loading: conversationsLoading,
    error: conversationsError
  } = useConversationStore();
  
  const [currentConversation, setCurrentConversation] = useState<any>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [messageLimit, setMessageLimit] = useState(50);
  const [showAllMessages, setShowAllMessages] = useState(false);

  // Memoize the loadMessages function to prevent it from changing on every render
  const loadMessages = useCallback(async (conversation: any) => {
    if (!conversation || !id) return;
    
    // Get the source file path from the conversation or fall back to currentSourceFile
    const sourceFilePath = conversation.filePath || currentSourceFile;
    
    if (!sourceFilePath) {
      setError('No source file path available for this conversation');
      return;
    }
    
    try {
      // Check cache first
      const cacheKey = `conversation_${id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.timestamp && (Date.now() - cachedData.timestamp) < 24 * 60 * 60 * 1000) {
            setMessages(cachedData.messages);
            setDisplayedMessages(cachedData.messages.slice(0, messageLimit));
            return;
          }
        } catch (error) {
          console.warn('Invalid cache data, reloading...');
        }
      }
      
      // Load from file using Electron API
      if (!window.electronAPI || !window.electronAPI.readSingleConversation) {
        throw new Error('Electron API not available');
      }
      
      const result = await window.electronAPI.readSingleConversation(sourceFilePath, id);
      
      if (!result.success || !result.found) {
        throw new Error('Conversation not found in file');
      }
      
      const conversationData = result.data;
      
      // Extract messages using the service
      let messages: Message[] = [];
      if (conversationData.mapping) {
        messages = extractMessagesFromMapping(conversationData.mapping);
      } else if (conversationData.messages) {
        messages = conversationData.messages;
      }
      
      setMessages(messages);
      setDisplayedMessages(messages.slice(0, messageLimit));
      
      // Cache the messages
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          messages,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to cache messages:', error);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  }, [id, currentSourceFile, messageLimit]);

  // Memoize the cleanup function
  const cleanupOldCache = useCallback(() => {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('conversation_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove invalid cache entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }, []);

  // Clean up old cache entries on mount
  useEffect(() => {
    cleanupOldCache();
  }, [cleanupOldCache]);

  // Load conversation and messages - only run when id changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get conversation from store
        const conversation = getConversationById(id);
        
        if (!conversation) {
          setError('Conversation not found');
          return;
        }
        
        setCurrentConversation(conversation);
        
        // Load messages
        await loadMessages(conversation);
        
      } catch (error) {
        console.error('Error loading conversation:', error);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversation();
  }, [id, getConversationById, loadMessages]);

  // Update displayed messages when messageLimit changes
  useEffect(() => {
    if (messages.length > 0) {
      setDisplayedMessages(messages.slice(0, messageLimit));
    }
  }, [messageLimit, messages]);

  const handleRefreshMessages = async () => {
    // Clear cache and reload messages
    try {
      localStorage.removeItem(`conversation_${id}`);
      await loadMessages(currentConversation);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  };

  const loadMoreMessages = () => {
    setMessageLimit(prev => Math.min(prev + 50, messages.length));
  };

  const showAllMessagesHandler = () => {
    setShowAllMessages(true);
  };

  return {
    // Data
    messages,
    displayedMessages,
    currentConversation,
    
    // State
    loading: loading || conversationsLoading,
    error: error || conversationsError,
    messageLimit,
    showAllMessages,
    
    // Actions
    handleRefreshMessages,
    loadMoreMessages,
    showAllMessagesHandler,
    
    // Computed values
    hasMoreMessages: messages.length > messageLimit && !showAllMessages,
    totalMessageCount: messages.length
  };
};
