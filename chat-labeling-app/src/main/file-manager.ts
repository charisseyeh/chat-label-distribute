import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { DatabaseManager } from './database-manager';

interface ConversationData {
  title: string;
  modelVersion?: string;
  conversationLength: number;
  metadata: any;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export class FileManager {
  private conversationsDir: string;
  private databaseManager: DatabaseManager;

  constructor(databaseManager: DatabaseManager) {
    this.databaseManager = databaseManager;
    
    // Set up conversations directory in user's documents folder
    const userDocumentsPath = path.join(os.homedir(), 'Documents', 'ChatLabelingApp');
    this.conversationsDir = path.join(userDocumentsPath, 'conversations');
    
    // Ensure the directory exists
    fs.ensureDirSync(this.conversationsDir);
  }

  async importConversation(filePath: string): Promise<any> {
    try {
      // Validate file exists and is readable
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist');
      }

      // Read and parse the JSON file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      let conversationData: ConversationData;

      try {
        conversationData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON file format');
      }

      // Validate conversation data structure
      this.validateConversationData(conversationData);

      // Generate a unique filename for storage
      const fileName = this.generateFileName(conversationData.title);
      const storagePath = path.join(this.conversationsDir, fileName);

      // Copy file to storage location
      await fs.copy(filePath, storagePath);

      // Create conversation in database
      const conversation = await this.databaseManager.createConversation({
        title: conversationData.title,
        modelVersion: conversationData.modelVersion,
        conversationLength: conversationData.conversationLength,
        metadata: conversationData.metadata,
        filePath: storagePath
      });

      // Create messages in database
      await this.databaseManager.createMessages(conversation.id, conversationData.messages);

      console.log(`Conversation imported successfully: ${conversation.title}`);

      return {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversationData.messages.length,
        filePath: storagePath
      };
    } catch (error) {
      console.error('Failed to import conversation:', error);
      throw error;
    }
  }

  private validateConversationData(data: any): void {
    // Check required fields
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Invalid or missing title');
    }

    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error('Invalid or missing messages array');
    }

    if (data.messages.length === 0) {
      throw new Error('Conversation must contain at least one message');
    }

    // Validate message structure
    for (let i = 0; i < data.messages.length; i++) {
      const message = data.messages[i];
      
      if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
        throw new Error(`Invalid role in message ${i + 1}: ${message.role}`);
      }

      if (!message.content || typeof message.content !== 'string') {
        throw new Error(`Invalid content in message ${i + 1}`);
      }
    }

    // Set default values for optional fields
    if (!data.conversationLength) {
      data.conversationLength = data.messages.length;
    }

    if (!data.metadata) {
      data.metadata = {
        importDate: new Date().toISOString(),
        sourceFile: 'imported'
      };
    }
  }

  private generateFileName(title: string): string {
    // Clean the title for use as filename
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50); // Limit length
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${cleanTitle}_${timestamp}.json`;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Get conversation details
      const conversation = await this.databaseManager.getConversation(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Delete from database (this will cascade to messages, responses, and labels)
      // Note: The actual deletion is handled by the database manager

      // Delete the stored file
      if (conversation.filePath && await fs.pathExists(conversation.filePath)) {
        await fs.remove(conversation.filePath);
        console.log(`Deleted file: ${conversation.filePath}`);
      }

      console.log(`Conversation deleted successfully: ${conversation.title}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  async getConversationFile(conversationId: string): Promise<string> {
    try {
      const conversation = await this.databaseManager.getConversation(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (!conversation.filePath || !await fs.pathExists(conversation.filePath)) {
        throw new Error('Conversation file not found');
      }

      return conversation.filePath;
    } catch (error) {
      console.error('Failed to get conversation file:', error);
      throw error;
    }
  }

  async readConversationFile(filePath: string): Promise<ConversationData> {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist');
      }

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const conversationData = JSON.parse(fileContent);

      this.validateConversationData(conversationData);
      return conversationData;
    } catch (error) {
      console.error('Failed to read conversation file:', error);
      throw error;
    }
  }

  async exportConversation(conversationId: string, exportPath: string): Promise<void> {
    try {
      const conversation = await this.databaseManager.getConversation(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Read the original file
      const originalData = await this.readConversationFile(conversation.filePath);

      // Add survey responses and AI labels to export
      const exportData = {
        ...originalData,
        surveyResponses: conversation.surveyResponses,
        aiLabels: conversation.aiLabels,
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          conversationId: conversation.id,
          originalFilePath: conversation.filePath
        }
      };

      // Write export file
      await fs.writeJson(exportPath, exportData, { spaces: 2 });
      console.log(`Conversation exported to: ${exportPath}`);
    } catch (error) {
      console.error('Failed to export conversation:', error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{
    conversationsDir: string;
    totalSize: number;
    fileCount: number;
  }> {
    try {
      const files = await fs.readdir(this.conversationsDir);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        const filePath = path.join(this.conversationsDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      }

      return {
        conversationsDir: this.conversationsDir,
        totalSize,
        fileCount
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw error;
    }
  }

  async cleanupOrphanedFiles(): Promise<number> {
    try {
      const files = await fs.readdir(this.conversationsDir);
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.conversationsDir, file);
        
        // Check if file is referenced in database
        // This is a simplified check - in production you might want more sophisticated logic
        const isReferenced = await this.isFileReferenced(filePath);
        
        if (!isReferenced) {
          await fs.remove(filePath);
          cleanedCount++;
          console.log(`Cleaned up orphaned file: ${file}`);
        }
      }

      console.log(`Cleanup completed. Removed ${cleanedCount} orphaned files.`);
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned files:', error);
      throw error;
    }
  }

  private async isFileReferenced(filePath: string): Promise<boolean> {
    try {
      // This is a simplified check - you might want to implement a more efficient query
      const conversations = await this.databaseManager.getConversations();
      return conversations.some(conv => conv.filePath === filePath);
    } catch (error) {
      console.error('Failed to check file reference:', error);
      return false; // Assume referenced to avoid accidental deletion
    }
  }
}
