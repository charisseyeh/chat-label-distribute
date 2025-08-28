import { useState } from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { ConversationService, type ConversationData } from '../../services/conversation';

export const useConversationLoader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    setLoadedConversations,
    setFilteredConversations,
    setCurrentSourceFile,
    clearSelection,
    clearLoadedConversations
  } = useConversationStore();

  const conversationService = new ConversationService();

  const loadConversationsFromFile = async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const conversationData = await conversationService.getConversationIndex(filePath);
      
      if (!Array.isArray(conversationData)) {
        throw new Error('Invalid conversation data received - expected array');
      }
      
      setLoadedConversations(conversationData);
      const filteredData = conversationData.filter(conv => conv.messageCount > 8);
      setFilteredConversations(filteredData);
      clearSelection();
      setCurrentSourceFile(filePath);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleNewFileSelect = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.electronAPI) {
        setError('Electron API not available');
        return;
      }

      const filePath = await window.electronAPI.selectConversationFile();
      if (!filePath) return;

      const storeResult = await window.electronAPI.storeJsonFile(filePath);
      if (!storeResult.success) {
        setError(`Failed to store file: ${storeResult.error}`);
        return;
      }

      await loadConversationsFromFile(storeResult.data.storedPath);
      
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    loadConversationsFromFile,
    handleNewFileSelect
  };
};
