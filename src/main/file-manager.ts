import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  importDate: string;
  fileSize: number;
}

export class FileManager {
  private storageDir: string;

  constructor() {
    // Set up storage directory in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'JSONFileReader');
    this.storageDir = path.join(userDocumentsPath, 'stored-files');
    
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
        fileSize
      };

      console.log(`File stored successfully: ${originalName} -> ${storedPath}`);
      return storedFile;

    } catch (error) {
      console.error('Failed to store file:', error);
      throw error;
    }
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
