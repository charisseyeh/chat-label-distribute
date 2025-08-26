import { ipcMain, dialog } from 'electron';
import { FileManager } from './file-manager';

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
  }
}
