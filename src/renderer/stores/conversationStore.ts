import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

        const filtered = loadedConversations.filter(conv => {
          if (activeFilters.relevant && activeFilters.notRelevant) {
            // Both filters active, show conversations with AI relevancy data
            return conv.aiRelevancy;
          } else if (activeFilters.relevant) {
            // Only relevant filter active
            return conv.aiRelevancy && conv.aiRelevancy.category === 'relevant';
          } else if (activeFilters.notRelevant) {
            // Only not-relevant filter active
            return conv.aiRelevancy && conv.aiRelevancy.category === 'not-relevant';
          }
          return false;
        });

        set({ filteredConversations: filtered });
      },

      // Convert temporary selection to permanent storage
      commitTemporarySelection: () => {
        const { selectedConversationIds, loadedConversations, currentSourceFile } = get();
        
        if (selectedConversationIds.length === 0) {
          return;
        }
        
        if (loadedConversations.length === 0) {
          return;
        }
        
        const newSelectedConversations = selectedConversationIds.map(id => {
          const conversation = loadedConversations.find(conv => conv.id === id);
          if (conversation) {
            const selectedConversation = {
              id: conversation.id,
              title: conversation.title,
              sourceFilePath: conversation.sourceFilePath || currentSourceFile || ''
            };
            return selectedConversation;
          }
          return {
            id,
            title: 'Unknown Conversation',
            sourceFilePath: currentSourceFile || ''
          };
        });
        
        // Also preserve the loaded conversations so they can be accessed on the labeling page
        const selectedConversationsForStore = selectedConversationIds.map(id => {
          const conv = loadedConversations.find(c => c.id === id);
          if (conv) {
            return {
              id: conv.id,
              title: conv.title,
              modelVersion: conv.modelVersion || 'Unknown',
              conversationLength: conv.messageCount || 0,
              createdAt: conv.createdAt || new Date().toISOString(),
              messageCount: conv.messageCount || 0,
              filePath: conv.sourceFilePath || currentSourceFile || ''
            };
          }
          return null;
        }).filter((conv): conv is NonNullable<typeof conv> => conv !== null);
        
        set({ 
          selectedConversations: newSelectedConversations,
          conversations: selectedConversationsForStore
        });
      },

      // Permanent storage operations
      loadSelectedConversationsFromStorage: async () => {
        try {
          const { preventReload } = get();
          
          // Don't reload if we just deleted a conversation
          if (preventReload) {
            return true;
          }
          
          if (window.electronAPI && window.electronAPI.getSelectedConversations) {
            const result = await window.electronAPI.getSelectedConversations();
            
            if (result.success && result.data && Array.isArray(result.data)) {
              // Convert SelectedConversation format to Conversation format for the store
              const conversationsForStore = result.data.map((conv: any) => ({
                id: conv.id,
                title: conv.title,
                modelVersion: 'Unknown',
                conversationLength: 0,
                createdAt: new Date().toISOString(),
                messageCount: 0,
                filePath: conv.sourceFilePath
              }));
              
              set({ 
                selectedConversations: result.data,
                selectedConversationIds: result.data.map((conv: any) => conv.id),
                conversations: conversationsForStore
              });
              
              // Also set the currentSourceFile if it's not already set
              const { currentSourceFile } = get();
              if (!currentSourceFile && result.data.length > 0) {
                const firstConversation = result.data[0];
                if (firstConversation.sourceFilePath) {
                  set({ currentSourceFile: firstConversation.sourceFilePath });
                }
              }
              
              return true;
            } else {
              console.warn('⚠️ loadSelectedConversationsFromStorage: No data or invalid data from API');
              set({ selectedConversations: [], selectedConversationIds: [], conversations: [] });
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
          
          // Allow saving empty arrays (for deletion purposes)
          if (window.electronAPI && window.electronAPI.storeSelectedConversations) {
            const result = await window.electronAPI.storeSelectedConversations(selectedConversations);
            if (result.success) {
              return true;
            } else {
              console.error('❌ saveSelectedConversationsToStorage: Failed to save selected conversations:', result.error);
            }
          } else {
            console.warn('⚠️ saveSelectedConversationsToStorage: Electron API not available for saving selected conversations');
          }
          return false;
        } catch (error) {
          console.error('❌ saveSelectedConversationsToStorage: Failed to save selected conversations to storage:', error);
          return false;
        }
      },

      clearAllSelectedAndSave: async () => {
        try {
          set({ selectedConversations: [], selectedConversationIds: [] });
          if (window.electronAPI && window.electronAPI.storeSelectedConversations) {
            const result = await window.electronAPI.storeSelectedConversations([]);
            if (result.success) {
              return true;
            } else {
              console.error('❌ Failed to save empty selection:', result.error);
            }
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
      // Only persist permanently stored conversations, not temporary selection state
      partialize: (state) => ({ 
        conversations: state.conversations,
        currentConversation: state.currentConversation,
        selectedConversations: state.selectedConversations,
        currentSourceFile: state.currentSourceFile, 
        loadedConversations: state.loadedConversations,
        filteredConversations: state.filteredConversations
      }),
    }
  )
);
