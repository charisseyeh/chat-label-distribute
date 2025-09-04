import { useEffect, useRef } from 'react';
import { useConversationStore } from '../../stores/conversationStore';

export const useStartupLoading = () => {
  const { loadSelectedConversationsFromStorage } = useConversationStore();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once per app session
    if (hasLoadedRef.current) {
      return;
    }

    const loadOnStartup = async () => {
      try {
        await loadSelectedConversationsFromStorage();
        hasLoadedRef.current = true;
      } catch (error) {
        console.warn('Failed to load selected conversations on startup:', error);
        hasLoadedRef.current = true; // Mark as loaded even on error to prevent retries
      }
    };
    
    loadOnStartup();
  }, [loadSelectedConversationsFromStorage]);
};
