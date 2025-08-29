import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ConversationData } from '../services/conversation';

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
  // Add these new fields for loaded conversations
  loadedConversations: ConversationData[]; // The conversations loaded from a file
  filteredConversations: ConversationData[]; // The filtered conversations
  // Add this flag to prevent reloading after deletion
  preventReload: boolean;
  // Add filtering state
  activeFilters: {
    relevant: boolean;
    notRelevant: boolean;
  };
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
  removeSelectedConversation: (id: string) => void; // New: remove individual selected conversation
  clearSelection: () => void;
  
  // File management
  setCurrentSourceFile: (filePath: string | null) => void; // New
  
  // Bulk operations
  setConversations: (conversations: Conversation[]) => void;
  clearConversations: () => void;

  // Loaded conversations management (NEW)
  setLoadedConversations: (conversations: ConversationData[]) => void;
  setFilteredConversations: (conversations: ConversationData[]) => void;
  clearLoadedConversations: () => void;
  
  // Filtering management
  toggleFilter: (filterType: 'relevant' | 'notRelevant') => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // Convert temporary selection to permanent storage
  commitTemporarySelection: () => void;

  // Permanent storage operations
  loadSelectedConversationsFromStorage: () => Promise<boolean>;
  saveSelectedConversationsToStorage: () => Promise<boolean>;
  clearAllSelectedAndSave: () => Promise<boolean>;
}

type ConversationStore = ConversationState & ConversationActions;

export const useConversationStore = create<ConversationStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        conversations: [],
        currentConversation: null,
        selectedConversationIds: [],
        selectedConversations: [], 
        currentSourceFile: null,
        loading: false,
        error: null,
        loadedConversations: [],
        filteredConversations: [],
        // Add this flag to prevent reloading after deletion
        preventReload: false,
        // Add filtering state
        activeFilters: {
          relevant: false,
          notRelevant: false,
        },

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
          const { conversations, selectedConversations, loadedConversations } = get();
          
          // First look in regular conversations
          let found = conversations.find(c => c.id === id);
          if (found) {
            return found;
          }
          
          // Then look in loaded conversations (which should have the full data)
          const loaded = loadedConversations.find(c => c.id === id);
          if (loaded) {
            // Convert ConversationData to Conversation format
            const converted = {
              id: loaded.id,
              title: loaded.title,
              modelVersion: loaded.modelVersion || 'Unknown',
              conversationLength: loaded.messageCount || 0, // Use messageCount as conversationLength
              createdAt: loaded.createdAt || new Date().toISOString(),
              messageCount: loaded.messageCount || 0,
              filePath: loaded.sourceFilePath || ''
            };
            return converted;
          }
          
          // Finally look in selected conversations
          const selected = selectedConversations.find(c => c.id === id);
          if (selected) {
            // Convert SelectedConversation to Conversation format
            const converted = {
              id: selected.id,
              title: selected.title,
              modelVersion: 'Unknown',
              conversationLength: 0,
              createdAt: new Date().toISOString(),
              messageCount: 0,
              filePath: selected.sourceFilePath
            };
            return converted;
          }
          
          return undefined;
        },

        // Selection management
        toggleConversationSelection: (id) => {
          const { selectedConversationIds } = get();
          const isSelected = selectedConversationIds.includes(id);
          
          if (isSelected) {
            // Remove from temporary selection only
            const newSelectedIds = selectedConversationIds.filter(selectedId => selectedId !== id);
            set({ selectedConversationIds: newSelectedIds });
          } else {
            // Add to temporary selection only
            const newSelectedIds = [...selectedConversationIds, id];
            set({ selectedConversationIds: newSelectedIds });
          }
        },

        setSelectedConversations: (ids) => {
          // Only set temporary selection IDs, don't populate selectedConversations
          set({ selectedConversationIds: ids });
        },

        setSelectedConversationsWithFile: (conversations) => set({ selectedConversations: conversations }), // New

        removeSelectedConversation: (id) => {
          const { selectedConversations } = get();
          const updated = selectedConversations.filter(conv => conv.id !== id);
          
          set({ 
            selectedConversations: updated,
            preventReload: true // Prevent automatic reloading after deletion
          });
          
          // Clear the preventReload flag after a short delay
          setTimeout(() => {
            set({ preventReload: false });
          }, 1000);
        },

        clearSelection: () => set({ selectedConversationIds: [], selectedConversations: [] }),

        // File management
        setCurrentSourceFile: (filePath) => set({ currentSourceFile: filePath }), // New
        
        // Bulk operations
        setConversations: (conversations) => set({ conversations }),
        clearConversations: () => set({ conversations: [], currentConversation: null }),

        // Loaded conversations management (NEW)
        setLoadedConversations: (conversations) => set({ loadedConversations: conversations }),
        setFilteredConversations: (conversations) => set({ filteredConversations: conversations }),
        clearLoadedConversations: () => set({ loadedConversations: [], filteredConversations: [] }),

        // Filtering management
        toggleFilter: (filterType) => {
          const { activeFilters } = get();
          const newFilters = { ...activeFilters };
          newFilters[filterType] = !newFilters[filterType];
          set({ activeFilters: newFilters });
        },

        clearFilters: () => {
          set({ activeFilters: { relevant: false, notRelevant: false } });
        },

        applyFilters: () => {
          const { loadedConversations, activeFilters } = get();
          
          if (!activeFilters.relevant && !activeFilters.notRelevant) {
            // No filters active, show all conversations
            set({ filteredConversations: loadedConversations });
            return;
          }
          
          // Apply filters
          const filtered = loadedConversations.filter(conv => {
            if (activeFilters.relevant && conv.aiRelevancy?.category === 'relevant') {
              return true;
            }
            if (activeFilters.notRelevant && conv.aiRelevancy?.category === 'not-relevant') {
              return true;
            }
            return false;
          });
          
          set({ filteredConversations: filtered });
        },

        // Convert temporary selection to permanent storage
        commitTemporarySelection: () => {
          const { selectedConversationIds, loadedConversations } = get();
          
          // Convert selected IDs to full conversation objects
          const newSelectedConversations = loadedConversations
            .filter(conv => selectedConversationIds.includes(conv.id))
            .map(conv => ({
              id: conv.id,
              title: conv.title,
              sourceFilePath: conv.sourceFilePath || ''
            }));
          
          set({ selectedConversations: newSelectedConversations });
        },

        // Permanent storage operations
        loadSelectedConversationsFromStorage: async () => {
          try {
            if (!window.electronAPI) return false;
            
            const result = await window.electronAPI.getSelectedConversations();
            if (result.success && result.data) {
              const conversations = result.data as SelectedConversation[];
              set({ selectedConversations: conversations });
              return true;
            }
            return false;
          } catch (error) {
            console.error('Failed to load selected conversations from storage:', error);
            return false;
          }
        },

        saveSelectedConversationsToStorage: async () => {
          try {
            if (!window.electronAPI) return false;
            
            const { selectedConversations } = get();
            const result = await window.electronAPI.storeSelectedConversations(selectedConversations);
            return result.success;
          } catch (error) {
            console.error('Failed to save selected conversations to storage:', error);
            return false;
          }
        },

        clearAllSelectedAndSave: async () => {
          try {
            if (!window.electronAPI) return false;
            
            const result = await window.electronAPI.storeSelectedConversations([]);
            if (result.success) {
              set({ selectedConversations: [], selectedConversationIds: [] });
              return true;
            }
            return false;
          } catch (error) {
            console.error('Failed to clear selected conversations:', error);
            return false;
          }
        },
      }),
      {
        name: 'conversation-storage',
        partialize: (state) => ({
          selectedConversations: state.selectedConversations,
          currentSourceFile: state.currentSourceFile,
        }),
      }
    )
  )
);

// Performance-optimized selectors
export const useSelectedConversationIds = () => useConversationStore(state => state.selectedConversationIds);
export const useSelectedConversations = () => useConversationStore(state => state.selectedConversations);
export const useLoadedConversations = () => useConversationStore(state => state.loadedConversations);
export const useFilteredConversations = () => useConversationStore(state => state.filteredConversations);
export const useCurrentSourceFile = () => useConversationStore(state => state.currentSourceFile);
export const useConversationLoading = () => useConversationStore(state => state.loading);
export const useConversationError = () => useConversationStore(state => state.error);
