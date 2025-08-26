import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectConversationFile: () => ipcRenderer.invoke('file:select-conversation'),
  storeJsonFile: (filePath: string) => ipcRenderer.invoke('file:store-json', filePath),
  getStoredFiles: () => ipcRenderer.invoke('file:get-stored-files'),
  deleteStoredFile: (fileId: string) => ipcRenderer.invoke('file:delete-stored-file', fileId),
  // Conversation operations
  readConversationsFromFile: (filePath: string) => ipcRenderer.invoke('conversations:read-from-file', filePath),
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      selectConversationFile: () => Promise<string | null>;
      storeJsonFile: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      getStoredFiles: () => Promise<{ success: boolean; data?: any; error?: string }>;
      deleteStoredFile: (fileId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      readConversationsFromFile: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    };
  }
}
