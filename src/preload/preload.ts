import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectConversationFile: () => ipcRenderer.invoke('file:select-conversation'),
  storeJsonFile: (filePath: string) => ipcRenderer.invoke('file:store-json', filePath),
  getStoredFiles: () => ipcRenderer.invoke('file:get-stored-files'),
  deleteStoredFile: (fileId: string) => ipcRenderer.invoke('file:delete-stored-file', fileId),
  getStorageStats: () => ipcRenderer.invoke('file:get-storage-stats'),
  cleanupDuplicateFiles: () => ipcRenderer.invoke('file:cleanup-duplicates'),
  // Conversation operations
  getConversationIndex: (filePath: string) => ipcRenderer.invoke('conversations:get-index', filePath),
  readSingleConversation: (filePath: string, conversationId: string) => ipcRenderer.invoke('conversations:read-single-conversation', filePath, conversationId),
  storeSelectedConversations: (selectedConversations: any[]) => ipcRenderer.invoke('conversations:store-selected', selectedConversations),
  getSelectedConversations: () => ipcRenderer.invoke('conversations:get-selected'),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      selectConversationFile: () => Promise<string | null>;
      storeJsonFile: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      getStoredFiles: () => Promise<{ success: boolean; data?: any; error?: string }>;
      deleteStoredFile: (fileId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      getStorageStats: () => Promise<{ success: boolean; data?: any; error?: string }>;
      cleanupDuplicateFiles: () => Promise<{ success: boolean; data?: any; error?: string }>;
      getConversationIndex: (filePath: string) => Promise<{ success: boolean; data?: Array<{id: string, title: string, createTime: number, messageCount: number, model?: string}>; total: number; returned: number; error?: string }>;
      readSingleConversation: (filePath: string, conversationId: string) => Promise<{ success: boolean; data?: any; found: boolean; error?: string }>;
      storeSelectedConversations: (selectedConversations: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
      getSelectedConversations: () => Promise<{ success: boolean; data?: any; found: boolean; lastUpdated?: string; totalSelected?: number; error?: string }>;
    };
  }
}
