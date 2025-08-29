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
    getFullConversationData,
    getFullConversationDataById,
    currentSourceFile,
    loadedConversations,
    selectedConversations,
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
    const sourceFilePath = conversation.filePath || conversation.sourceFilePath || currentSourceFile;
    
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
      
      // First try to get the full conversation data from the store
      const fullConversationData = getFullConversationDataById(id);
      if (fullConversationData) {
        console.log('✅ Using stored full conversation data for:', id);
        
        // Extract messages using the service
        let messages: Message[] = [];
        if (fullConversationData.mapping) {
          messages = extractMessagesFromMapping(fullConversationData.mapping);
        } else if (fullConversationData.messages) {
          messages = fullConversationData.messages;
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
        
        return;
      }
      
      // Fallback: Load from file using Electron API
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
  }, [id, currentSourceFile, messageLimit, getFullConversationDataById]);

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
        
        // First try to get conversation from loaded conversations
        let conversation = loadedConversations.find(conv => conv.id === id);
        console.log('🔍 Looking for conversation:', id);
        console.log('🔍 Loaded conversations:', loadedConversations.length);
        console.log('🔍 Selected conversations:', selectedConversations.length);
        
        // If not found in loaded conversations, try selected conversations
        if (!conversation) {
          const selectedConv = selectedConversations.find(conv => conv.id === id);
          if (selectedConv) {
            // Convert SelectedConversation to ConversationData format
            conversation = {
              id: selectedConv.id,
              title: selectedConv.title,
              messageCount: 0,
              sourceFilePath: selectedConv.sourceFilePath
            };
          }
          console.log('🔍 Found in selected conversations:', !!conversation);
        }
        
        // If still not found, try to get from store using the new method
        if (!conversation) {
          const fullData = getFullConversationDataById(id);
          if (fullData) {
            // Convert to ConversationData format
            conversation = {
              id: fullData.id || fullData.conversation_id || id,
              title: fullData.title || 'Untitled Conversation',
              messageCount: fullData.mapping ? Object.keys(fullData.mapping).length : 0,
              sourceFilePath: fullData.sourceFilePath || currentSourceFile
            };
          }
          console.log('🔍 Found in full conversation data:', !!conversation);
        }
        
        // Final fallback to the old method
        if (!conversation) {
          const regularConv = getConversationById(id);
          if (regularConv) {
            // Convert Conversation to ConversationData format
            conversation = {
              id: regularConv.id,
              title: regularConv.title,
              messageCount: regularConv.messageCount,
              sourceFilePath: regularConv.filePath
            };
          }
          console.log('🔍 Found in regular conversations:', !!conversation);
        }
        
        if (!conversation) {
          console.error('❌ Conversation not found in any store');
          setError('Conversation not found in any store');
          return;
        }
        
        console.log('✅ Found conversation:', conversation);
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
  }, [id, getConversationById, loadMessages, loadedConversations, selectedConversations, getFullConversationDataById]);

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
