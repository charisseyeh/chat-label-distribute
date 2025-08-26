import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectConversationFile: () => ipcRenderer.invoke('file:select-conversation'),
  importConversation: (filePath: string) => ipcRenderer.invoke('file:import-conversation', filePath),
  
  // Database operations
  getConversations: () => ipcRenderer.invoke('db:get-conversations'),
  getConversation: (id: string) => ipcRenderer.invoke('db:get-conversation', id),
  
  // Survey operations
  saveSurveyResponse: (response: any) => ipcRenderer.invoke('survey:save-response', response),
  
  // AI operations
  generateAILabels: (conversationId: string, position: string) => 
    ipcRenderer.invoke('ai:generate-labels', conversationId, position),
  
  // Export operations
  generateExport: (options: any) => ipcRenderer.invoke('export:generate-export', options),
  
  // Menu events
  onMenuImportConversation: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu:import-conversation', (event, filePath) => callback(filePath));
  },
  
  onMenuExportData: (callback: () => void) => {
    ipcRenderer.on('menu:export-data', () => callback());
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      selectConversationFile: () => Promise<string | undefined>;
      importConversation: (filePath: string) => Promise<any>;
      getConversations: () => Promise<any[]>;
      getConversation: (id: string) => Promise<any>;
      saveSurveyResponse: (response: any) => Promise<any>;
      generateAILabels: (conversationId: string, position: string) => Promise<any>;
      generateExport: (options: any) => Promise<any>;
      onMenuImportConversation: (callback: (filePath: string) => void) => void;
      onMenuExportData: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
