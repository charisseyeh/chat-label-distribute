import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  importDate: string;
  fileSize: number;
  originalPath: string;
}

export class FileManager {
  private storageDir: string;

  constructor() {
    // Set up storage directory in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
    this.storageDir = path.join(userDocumentsPath, 'conversations');
    
    // Ensure the directory exists
    fs.ensureDirSync(this.storageDir);
  }

  async storeJsonFile(filePath: string): Promise<StoredFile> {
    try {
      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist');
      }

      // Read file to get size
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Generate unique ID and filename
      const id = this.generateUniqueId();
      const originalName = path.basename(filePath);
      const storedFileName = `${id}_${originalName}`;
      const storedPath = path.join(this.storageDir, storedFileName);

      // Copy file to storage
      await fs.copy(filePath, storedPath);

      // Create stored file record
      const storedFile: StoredFile = {
        id,
        originalName,
        storedPath,
        importDate: new Date().toISOString(),
        fileSize,
        originalPath: filePath
      };

      console.log(`File stored successfully: ${originalName} -> ${storedPath}`);
      return storedFile;

    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }
  }

  async getStoredFiles(): Promise<StoredFile[]> {
    try {
      const files = await fs.readdir(this.storageDir);
      const storedFiles: StoredFile[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storageDir, file);
          const stats = await fs.stat(filePath);
          
          // Extract ID and original name from filename
          const parts = file.split('_');
          const id = parts[0];
          const originalName = parts.slice(1).join('_');
          
          storedFiles.push({
            id,
            originalName,
            storedPath: filePath,
            importDate: stats.birthtime.toISOString(),
            fileSize: stats.size,
            originalPath: '' // We don't store this anymore
          });
        }
      }

      return storedFiles.sort((a, b) => 
        new Date(b.importDate).getTime() - new Date(a.importDate).getTime()
      );
    } catch (error) {
      console.error('Failed to get stored files:', error);
      return [];
    }
  }

  async deleteStoredFile(id: string): Promise<boolean> {
    try {
      const files = await this.getStoredFiles();
      const fileToDelete = files.find(f => f.id === id);
      
      if (!fileToDelete) {
        return false;
      }

      await fs.remove(fileToDelete.storedPath);
      console.log(`Deleted stored file: ${fileToDelete.originalName}`);
      return true;
    } catch (error) {
      console.error('Failed to delete stored file:', error);
      return false;
    }
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
