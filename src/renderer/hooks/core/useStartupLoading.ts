import { useEffect, useRef } from 'react';
import { useConversationStore } from '../../stores/conversationStore';

export const useStartupLoading = () => {
  const { 
    loadSelectedConversationsFromStorage, 
    currentSourceFile, 
    loadedConversations,
    ensureConversationsLoaded 
  } = useConversationStore();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once per app session
    if (hasLoadedRef.current) {
      return;
    }

    const loadOnStartup = async () => {
      try {
        // First load selected conversations from storage
        await loadSelectedConversationsFromStorage();
        
        // Then check if we have a persisted source file but no loaded conversations
        // This handles the case where the app was closed with a file loaded
        if (currentSourceFile && loadedConversations.length === 0) {
          try {
            await ensureConversationsLoaded(currentSourceFile);
          } catch (error) {
            console.warn('Failed to restore conversations from source file:', error);
          }
        }
        
        hasLoadedRef.current = true;
      } catch (error) {
        console.warn('Failed to load data on startup:', error);
        hasLoadedRef.current = true; // Mark as loaded even on error to prevent retries
      }
    };
    
    loadOnStartup();
  }, [loadSelectedConversationsFromStorage, currentSourceFile, loadedConversations, ensureConversationsLoaded]);
};
