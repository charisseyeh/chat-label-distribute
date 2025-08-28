import { useState, useEffect } from 'react';
import { ConversationService, type ConversationData } from '../../services/conversation';

export const useConversationService = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationService = new ConversationService();

  const loadConversations = async (filePath?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (filePath) {
        const conversationData = await conversationService.getConversationIndex(filePath);
        setConversations(conversationData);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    loading,
    error,
    loadConversations,
  };
};
