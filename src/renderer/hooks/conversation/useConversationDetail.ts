import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useConversationStore,
  useSelectedConversations,
  useLoadedConversations,
  useCurrentSourceFile,
  useConversationLoading,
  useConversationError
} from '../../stores/conversationStore';
import { extractMessagesFromMapping } from '../../services/conversation';
import React from 'react'; // Added missing import for React.useMemo

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
}

export const useConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use optimized selectors to prevent unnecessary re-renders
  const selectedConversations = useSelectedConversations();
  const loadedConversations = useLoadedConversations();
  const currentSourceFile = useCurrentSourceFile();
  const conversationsLoading = useConversationLoading();
  const conversationsError = useConversationError();
  
  // Only get the functions we need from the store
  const { 
    getConversationById,
    getFullConversationData,
    getFullConversationDataById,
    ensureConversationsLoaded,
    loadFullConversationData
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
              // Debug logging removed for production
        
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

  // Memoize the loadConversation function to prevent it from changing on every render
  const loadConversation = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First try to get conversation from selected conversations
      let conversation: any = selectedConversations.find(conv => conv.id === id);
      
      if (conversation) {
        // Ensure all conversations are loaded from the source file
        const sourceFilePath = conversation.sourceFilePath;
        if (sourceFilePath) {
          const loadedConvs = await ensureConversationsLoaded(sourceFilePath);
          
          // Also load the full conversation data for the current conversation
          const fullData = await loadFullConversationData(id, sourceFilePath);
          if (!fullData) {
            // Silent warning - no console log needed
          }
        }
      } else {
        // If not found in selected conversations, try loaded conversations
        conversation = loadedConversations.find(conv => conv.id === id);
        
        if (conversation) {
          // Ensure conversations are loaded for this source file
          const sourceFilePath = conversation.sourceFilePath || currentSourceFile;
          if (sourceFilePath) {
            const loadedConvs = await ensureConversationsLoaded(sourceFilePath);
          }
        }
      }
      
      // If still not found, try to get from store using the new method
      if (!conversation) {
        const fullData = getFullConversationDataById(id);
        if (fullData) {
          // Convert to conversation format
          conversation = {
            id: fullData.id || fullData.conversation_id || id,
            title: fullData.title || 'Untitled Conversation',
            messageCount: fullData.mapping ? Object.keys(fullData.mapping).length : 0,
            sourceFilePath: fullData.sourceFilePath || currentSourceFile
          };
        }
      }
      
      // Final fallback to the old method
      if (!conversation) {
        const regularConv = getConversationById(id);
        if (regularConv) {
          // Convert Conversation to conversation format
          conversation = {
            id: regularConv.id,
            title: regularConv.title,
            messageCount: regularConv.messageCount,
            sourceFilePath: regularConv.filePath
          };
        }
      }
      
      if (!conversation) {
        setError('Conversation not found in any store');
        return;
      }
      setCurrentConversation(conversation);
      
      // Load messages
      await loadMessages(conversation);
      
    } catch (error) {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [id, getConversationById, loadMessages, loadedConversations, selectedConversations, getFullConversationDataById, ensureConversationsLoaded, loadFullConversationData, currentSourceFile]);

  // Load conversation and messages - only run when id changes
  useEffect(() => {
    loadConversation();
  }, [id]); // Only depend on id, not loadConversation

  // Update displayed messages when messageLimit changes
  useEffect(() => {
    if (messages.length > 0) {
      setDisplayedMessages(messages.slice(0, messageLimit));
    }
  }, [messageLimit, messages]);

  // Memoize the handleRefreshMessages function
  const handleRefreshMessages = useCallback(async () => {
    // Clear cache and reload messages
    try {
      localStorage.removeItem(`conversation_${id}`);
      await loadMessages(currentConversation);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
  }, [id, loadMessages, currentConversation]);

  // Memoize the loadMoreMessages function
  const loadMoreMessages = useCallback(() => {
    setMessageLimit(prev => Math.min(prev + 50, messages.length));
  }, [messages.length]);

  // Memoize the showAllMessagesHandler function
  const showAllMessagesHandler = useCallback(() => {
    setShowAllMessages(true);
  }, []);

  // Memoize the computed values to prevent unnecessary re-renders
  const hasMoreMessages = React.useMemo(() => 
    messages.length > messageLimit && !showAllMessages, 
    [messages.length, messageLimit, showAllMessages]
  );

  const totalMessageCount = React.useMemo(() => messages.length, [messages.length]);

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
    hasMoreMessages,
    totalMessageCount
  };
};
