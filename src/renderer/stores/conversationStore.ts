import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Conversation {
  id: string;
  title: string;
  modelVersion?: string;
  conversationLength: number;
  createdAt: string;
  messageCount: number;
  filePath: string; // Local file path for Electron
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

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sequenceOrder: number;
  createdAt: string;
}

// New interface for selected conversations with file path
export interface SelectedConversation {
  id: string;
  title: string;
  sourceFilePath: string; // Path to the original conversations.json file
}

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  selectedConversationIds: string[];
  selectedConversations: SelectedConversation[]; // New: full selected conversation data
  currentSourceFile: string | null; // New: current source file path
  loading: boolean;
  error: string | null;
}

interface ConversationActions {
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Conversation management
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  getConversationById: (id: string) => Conversation | undefined;
  
  // Selection management
  toggleConversationSelection: (id: string) => void;
  setSelectedConversations: (ids: string[]) => void;
  setSelectedConversationsWithFile: (conversations: SelectedConversation[]) => void; // New
  clearSelection: () => void;
  
  // File management
  setCurrentSourceFile: (filePath: string) => void; // New
  
  // Bulk operations
  setConversations: (conversations: Conversation[]) => void;
  clearConversations: () => void;

  // Permanent storage operations
  loadSelectedConversationsFromStorage: () => Promise<boolean>;
  saveSelectedConversationsToStorage: () => Promise<boolean>;
  clearAllSelectedAndSave: () => Promise<boolean>;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversation: null,
      selectedConversationIds: [],
      selectedConversations: [], // New
      currentSourceFile: null, // New
      loading: false,
      error: null,

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Conversation management
      addConversation: (conversation) => {
        const { conversations } = get();
        const existingIndex = conversations.findIndex(c => c.id === conversation.id);
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...conversations];
          updated[existingIndex] = conversation;
          set({ conversations: updated });
        } else {
          // Add new
          set({ conversations: [...conversations, conversation] });
        }
      },

      updateConversation: (id, updates) => {
        const { conversations } = get();
        const updated = conversations.map(c => 
          c.id === id ? { ...c, ...updates } : c
        );
        set({ conversations: updated });
      },

      removeConversation: (id) => {
        const { conversations } = get();
        const filtered = conversations.filter(c => c.id !== id);
        set({ conversations: filtered });
        
        // Clear current if it was removed
        const { currentConversation } = get();
        if (currentConversation?.id === id) {
          set({ currentConversation: null });
        }
      },

      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

      getConversationById: (id: string) => {
        const { conversations } = get();
        return conversations.find(c => c.id === id);
      },

      // Selection management
      toggleConversationSelection: (id) => {
        const { selectedConversationIds } = get();
        const isSelected = selectedConversationIds.includes(id);
        
        if (isSelected) {
          set({ selectedConversationIds: selectedConversationIds.filter(selectedId => selectedId !== id) });
        } else {
          set({ selectedConversationIds: [...selectedConversationIds, id] });
        }
      },

      setSelectedConversations: (ids) => set({ selectedConversationIds: ids }),

      setSelectedConversationsWithFile: (conversations) => set({ selectedConversations: conversations }), // New

      clearSelection: () => set({ selectedConversationIds: [], selectedConversations: [] }), // Updated

      // File management
      setCurrentSourceFile: (filePath) => set({ currentSourceFile: filePath }), // New
      
      // Bulk operations
      setConversations: (conversations) => set({ conversations }),
      clearConversations: () => set({ conversations: [], currentConversation: null }),

      // Permanent storage operations
      loadSelectedConversationsFromStorage: async () => {
        try {
          console.log('🔄 Loading selected conversations from permanent storage...');
          if (window.electronAPI && window.electronAPI.getSelectedConversations) {
            const result = await window.electronAPI.getSelectedConversations();
            if (result.success && result.found && result.data) {
              console.log(`✅ Loaded ${result.data.length} selected conversations from storage`);
              set({ 
                selectedConversations: result.data,
                selectedConversationIds: result.data.map((conv: any) => conv.id)
              });
              return true;
            } else {
              console.log('ℹ️ No selected conversations found in storage');
            }
          } else {
            console.warn('⚠️ Electron API not available for loading selected conversations');
          }
          return false;
        } catch (error) {
          console.error('❌ Failed to load selected conversations from storage:', error);
          return false;
        }
      },

      saveSelectedConversationsToStorage: async () => {
        try {
          const { selectedConversations } = get();
          console.log(`💾 Saving ${selectedConversations.length} selected conversations to permanent storage...`);
          if (window.electronAPI && window.electronAPI.storeSelectedConversations) {
            const result = await window.electronAPI.storeSelectedConversations(selectedConversations);
            if (result.success) {
              console.log('✅ Successfully saved selected conversations to permanent storage');
            } else {
              console.error('❌ Failed to save selected conversations:', result.error);
            }
            return result.success;
          } else {
            console.warn('⚠️ Electron API not available for saving selected conversations');
          }
          return false;
        } catch (error) {
          console.error('❌ Failed to save selected conversations to storage:', error);
          return false;
        }
      },

      clearAllSelectedAndSave: async () => {
        try {
          console.log('🗑️ Clearing all selected conversations and saving to storage...');
          set({ selectedConversations: [], selectedConversationIds: [] });
          if (window.electronAPI && window.electronAPI.storeSelectedConversations) {
            const result = await window.electronAPI.storeSelectedConversations([]);
            if (result.success) {
              console.log('✅ Successfully cleared and saved empty selection to storage');
            } else {
              console.error('❌ Failed to save empty selection:', result.error);
            }
            return result.success;
          } else {
            console.warn('⚠️ Electron API not available for clearing selected conversations');
          }
          return false;
        } catch (error) {
          console.error('❌ Failed to clear and save selected conversations:', error);
          return false;
        }
      },
    }),
    {
      name: 'conversation-storage',
      // Only persist conversations, not loading/error states
      partialize: (state) => ({ 
        conversations: state.conversations,
        currentConversation: state.currentConversation,
        selectedConversationIds: state.selectedConversationIds, // Persist selected conversation IDs
        selectedConversations: state.selectedConversations, // Persist selected conversations with file paths
        currentSourceFile: state.currentSourceFile // Persist source file
      }),
    }
  )
);
