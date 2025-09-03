import { create } from 'zustand';

export type Page = 'select-conversations' | 'label-conversations' | 'ai-comparisons' | 'ai-simulation' | 'survey-templates' | 'survey-questions';

export interface NavigationState {
  currentPage: Page;
  selectedConversations: Array<{
    id: string;
    title: string;
  }>;
  currentConversationId: string | null;
  currentTemplateId: string | null;
  setCurrentPage: (page: Page) => void;
  setSelectedConversations: (conversations: Array<{ id: string; title: string }>) => void;
  addSelectedConversation: (conversation: { id: string; title: string }) => void;
  removeSelectedConversation: (id: string) => void;
  clearSelectedConversations: () => void;
  setCurrentConversationId: (id: string | null) => void;
  setCurrentTemplateId: (id: string | null) => void;
  // New: Batch update for better performance
  batchUpdate: (updates: Partial<Pick<NavigationState, 'currentPage' | 'currentConversationId' | 'currentTemplateId'>>) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'select-conversations',
  selectedConversations: [],
  currentConversationId: null,
  currentTemplateId: null,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setSelectedConversations: (conversations) => set({ selectedConversations: conversations }),
  
  addSelectedConversation: (conversation) => set((state) => ({
    selectedConversations: [...state.selectedConversations, conversation]
  })),
  
  removeSelectedConversation: (id) => set((state) => ({
    selectedConversations: state.selectedConversations.filter(conv => conv.id !== id)
  })),
  
  clearSelectedConversations: () => set({ selectedConversations: [] }),
  
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  setCurrentTemplateId: (id) => set({ currentTemplateId: id }),
  
  // Batch update for better performance - reduces multiple re-renders
  batchUpdate: (updates) => set((state) => ({ ...state, ...updates })),
}));
