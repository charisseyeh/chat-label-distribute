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

    // Read conversations from stored file
    ipcMain.handle('conversations:read-from-file', async (event, filePath: string) => {
      try {
        // Read the JSON file and return raw content
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
                return { success: true, data: jsonData };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    });
  }
}
