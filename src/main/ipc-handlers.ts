import { ipcMain, dialog } from 'electron';
import { FileManager } from './file-manager';
import * as fs from 'fs-extra';

export class IPCHandlers {
  private fileManager: FileManager;

  constructor() {
    this.fileManager = new FileManager();
    this.setupHandlers();
  }

  private setupHandlers() {
    // File selection dialog
    ipcMain.handle('file:select-conversation', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    });

    // Store JSON file
    ipcMain.handle('file:store-json', async (event, filePath: string) => {
      try {
        const storedFile = await this.fileManager.storeJsonFile(filePath);
        return { success: true, data: storedFile };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Get list of stored files
    ipcMain.handle('file:get-stored-files', async () => {
      try {
        const storedFiles = await this.fileManager.getStoredFiles();
        return { success: true, data: storedFiles };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Delete stored file
    ipcMain.handle('file:delete-stored-file', async (event, fileId: string) => {
      try {
        const success = await this.fileManager.deleteStoredFile(fileId);
        return { success, data: { deleted: success } };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Get storage statistics
    ipcMain.handle('file:get-storage-stats', async () => {
      try {
        const stats = await this.fileManager.getStorageStats();
        return { success: true, data: stats };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Cleanup duplicate files
    ipcMain.handle('file:cleanup-duplicates', async () => {
      try {
        const result = await this.fileManager.cleanupDuplicateFiles();
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Get conversation index (titles only) for selection list
    ipcMain.handle('conversations:get-index', async (event, filePath: string) => {
      try {
        // Simple approach: read file and extract only what we need
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        let conversations: any[] = [];
        
        // Handle different data structures
        if (Array.isArray(jsonData)) {
          // Direct array of conversations
          conversations = jsonData;
        } else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
          // Nested conversations array
          conversations = jsonData.conversations;
        } else if (jsonData.conversation) {
          // Single conversation
          conversations = [jsonData.conversation];
        } else {
          // Unexpected data structure
          throw new Error('Unexpected data structure in conversation file');
        }
        
        // Create a lightweight index with only essential data
        const conversationIndex = conversations.map(conv => ({
          id: conv.conversation_id || conv.id || `conv_${Date.now()}_${Math.random()}`,
          title: conv.title || 'Untitled Conversation',
          modelVersion: conv.model || 'Unknown',
          conversationLength: conv.mapping ? Object.keys(conv.mapping).length * 100 : 0,
          createdAt: new Date((conv.create_time || Date.now()) * 1000).toISOString(),
          messageCount: (() => {
            if (!conv.mapping) return 0;
            return Object.keys(conv.mapping).filter(key => {
              const message = conv.mapping[key].message;
              if (!message || !message.content || !message.content.parts || !Array.isArray(message.content.parts)) {
                return false;
              }
              const firstPart = message.content.parts[0];
              return firstPart && typeof firstPart === 'string' && firstPart.trim() !== '';
            }).length;
          })(),
          sourceFilePath: filePath
        }));
        
        return { success: true, data: conversationIndex };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to get conversation index' 
        };
      }
    });

    // Read a single conversation by ID from file
    ipcMain.handle('conversations:read-single-conversation', async (event, filePath: string, conversationId: string) => {
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        let foundConversation: any = null;
        
        // Find the specific conversation
        if (Array.isArray(jsonData)) {
          foundConversation = jsonData.find((conv: any) => 
            (conv.conversation_id || conv.id) === conversationId
          );
        } else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
          foundConversation = jsonData.conversations.find((conv: any) => 
            (conv.conversation_id || conv.id) === conversationId
          );
        } else if (jsonData.conversation_id === conversationId || jsonData.id === conversationId) {
          foundConversation = jsonData;
        }
        
        return { 
          success: true, 
          data: foundConversation,
          found: !!foundConversation
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          found: false
        };
      }
    });

    // Store selected conversation IDs permanently
    ipcMain.handle('conversations:store-selected', async (event, selectedConversations: any[]) => {
      try {
        const selectedDir = this.fileManager.getSelectedConversationsDirectory();
        const selectedFile = `${selectedDir}/selected-conversations.json`;
        
        // Save selected conversations with metadata
        const dataToStore = {
          selectedConversations,
          lastUpdated: new Date().toISOString(),
          totalSelected: selectedConversations.length
        };
        
        await fs.ensureDir(selectedDir);
        await fs.writeFile(selectedFile, JSON.stringify(dataToStore, null, 2));
        
        return { success: true, data: { saved: true } };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });

    // Retrieve selected conversation IDs
    ipcMain.handle('conversations:get-selected', async () => {
      try {
        const selectedDir = this.fileManager.getSelectedConversationsDirectory();
        const selectedFile = `${selectedDir}/selected-conversations.json`;
        
        if (!(await fs.pathExists(selectedFile))) {
          return { success: true, data: [], found: false };
        }
        
        const content = await fs.readFile(selectedFile, 'utf-8');
        const data = JSON.parse(content);
        
        return { 
          success: true, 
          data: data.selectedConversations || [],
          found: true,
          lastUpdated: data.lastUpdated,
          totalSelected: data.totalSelected
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          found: false
        };
      }
    });
  }
}
