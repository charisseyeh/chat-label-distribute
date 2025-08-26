import { useState, useEffect } from 'react';

export interface Conversation {
  id: string;
  title: string;
  modelVersion?: string;
  conversationLength: number;
  createdAt: string;
  messageCount: number;
}

export interface ImportedConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, {
    id: string;
    message?: {
      content: {
        parts: Array<{
          content: string;
        }>;
      };
      role: string;
      create_time: number;
    };
    parent?: string;
    children?: string[];
  }>;
  current_node: string;
  conversation_id: string;
  model?: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    try {
      setLoading(true);
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      } else {
        // Mock data for development
        const mockConversations: Conversation[] = [
          {
            id: '1',
            title: 'Sample Conversation 1',
            modelVersion: 'GPT-4',
            conversationLength: 15,
            createdAt: new Date().toISOString(),
            messageCount: 15
          },
          {
            id: '2',
            title: 'Sample Conversation 2',
            modelVersion: 'GPT-3.5',
            conversationLength: 8,
            createdAt: new Date().toISOString(),
            messageCount: 8
          }
        ];
        setConversations(mockConversations);
        localStorage.setItem('conversations', JSON.stringify(mockConversations));
      }
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const addConversation = (conversation: Conversation) => {
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    let updatedConversations: Conversation[];
    if (existingIndex >= 0) {
      updatedConversations = [...conversations];
      updatedConversations[existingIndex] = conversation;
    } else {
      updatedConversations = [...conversations, conversation];
    }
    
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const getConversationById = (id: string): Conversation | undefined => {
    return conversations.find(c => c.id === id);
  };

  const clearError = () => setError(null);

  return {
    conversations,
    loading,
    error,
    addConversation,
    getConversationById,
    clearError,
    reload: loadConversations
  };
};
