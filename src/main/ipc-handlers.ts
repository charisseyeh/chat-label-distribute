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
      const startTime = performance.now();
      console.log(`📋 IPC: Getting conversation index from: ${filePath}`);
      
      try {
        const stats = await fs.stat(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        console.log(`📊 IPC: File size: ${fileSizeMB.toFixed(2)}MB`);
        
        // Simple approach: read file and extract only what we need
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        let conversations: any[] = [];
        
        if (Array.isArray(jsonData)) {
          conversations = jsonData;
        } else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
          conversations = jsonData.conversations;
        } else if (jsonData.conversation_id) {
          conversations = [jsonData];
        }
        
        const totalConversations = conversations.length;
        console.log(`📚 IPC: Total conversations in file: ${totalConversations}`);
        
        // Extract only the metadata we need for the list (ALL conversations)
        const conversationIndex = conversations.map(conv => ({
          id: conv.conversation_id || conv.id || `conv_${Date.now()}`,
          title: conv.title || 'Untitled Conversation',
          createTime: conv.create_time || Date.now(),
          messageCount: conv.mapping ? Object.keys(conv.mapping).filter(key => conv.mapping[key].message).length : 0,
          model: conv.model || 'Unknown'
        }));
        
        const totalTime = performance.now() - startTime;
        console.log(`✅ IPC: Indexed ALL ${conversationIndex.length} conversations in ${totalTime.toFixed(2)}ms`);
        
        return { 
          success: true, 
          data: conversationIndex,
          total: totalConversations,
          returned: conversationIndex.length
        };
      } catch (error) {
        const totalTime = performance.now() - startTime;
        console.error(`❌ IPC: Indexing failed after ${totalTime.toFixed(2)}ms:`, error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          data: [],
          total: 0,
          returned: 0
        };
      }
    });

    // Read a single conversation by ID from file
    ipcMain.handle('conversations:read-single-conversation', async (event, filePath: string, conversationId: string) => {
      const startTime = performance.now();
      console.log(`🎯 IPC: Reading single conversation ${conversationId} from: ${filePath}`);
      
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
        
        const totalTime = performance.now() - startTime;
        console.log(`🎯 IPC: Single conversation read took ${totalTime.toFixed(2)}ms`);
        
        return { 
          success: true, 
          data: foundConversation,
          found: !!foundConversation
        };
      } catch (error) {
        const totalTime = performance.now() - startTime;
        console.error(`❌ IPC: Single conversation read failed after ${totalTime.toFixed(2)}ms:`, error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          found: false
        };
      }
    });
  }
}
