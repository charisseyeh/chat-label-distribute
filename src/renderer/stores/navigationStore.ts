import { create } from 'zustand';

export type Page = 'select-conversations' | 'label-conversations' | 'ai-comparisons' | 'survey-questions';

export interface NavigationState {
  currentPage: Page;
  selectedConversations: Array<{
    id: string;
    title: string;
  }>;
  setCurrentPage: (page: Page) => void;
  setSelectedConversations: (conversations: Array<{ id: string; title: string }>) => void;
  addSelectedConversation: (conversation: { id: string; title: string }) => void;
  removeSelectedConversation: (id: string) => void;
  clearSelectedConversations: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'select-conversations',
  selectedConversations: [],
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setSelectedConversations: (conversations) => set({ selectedConversations: conversations }),
  
  addSelectedConversation: (conversation) => set((state) => ({
    selectedConversations: [...state.selectedConversations, conversation]
  })),
  
  removeSelectedConversation: (id) => set((state) => ({
    selectedConversations: state.selectedConversations.filter(conv => conv.id !== id)
  })),
  
  clearSelectedConversations: () => set({ selectedConversations: [] }),
}));
