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

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  selectedConversationIds: string[];
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
  clearSelection: () => void;
  
  // Bulk operations
  setConversations: (conversations: Conversation[]) => void;
  clearConversations: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversation: null,
      selectedConversationIds: [],
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

      clearSelection: () => set({ selectedConversationIds: [] }),

      // Bulk operations
      setConversations: (conversations) => set({ conversations }),
      clearConversations: () => set({ conversations: [], currentConversation: null }),
    }),
    {
      name: 'conversation-storage',
      // Only persist conversations, not loading/error states
      partialize: (state) => ({ 
        conversations: state.conversations,
        currentConversation: state.currentConversation 
      }),
    }
  )
);
