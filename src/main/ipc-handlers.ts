import { ipcMain, dialog } from 'electron';
import { FileManager } from './file-manager';
import * as fs from 'fs-extra';
import axios from 'axios';

export class IPCHandlers {
  private fileManager: FileManager;

  constructor() {
    this.fileManager = new FileManager();
    this.setupHandlers();
  }

  // Helper method to analyze conversation content quality
  private analyzeContentQuality(conversation: any): any {
    try {
      if (!conversation.mapping) {
        return { hasMapping: false, totalNodes: 0, validMessages: 0, contentIssues: ['No mapping found'] };
      }

      const totalNodes = Object.keys(conversation.mapping).length;
      let validMessages = 0;
      const contentIssues: string[] = [];
      const messageSamples: string[] = [];

      Object.entries(conversation.mapping).forEach(([nodeId, msg]: [string, any]) => {
        if (!msg.message) {
          contentIssues.push(`Node ${nodeId}: No message object`);
          return;
        }

        if (!msg.message.content) {
          contentIssues.push(`Node ${nodeId}: No content object`);
          return;
        }

        if (!msg.message.content.parts || !Array.isArray(msg.message.content.parts)) {
          contentIssues.push(`Node ${nodeId}: Invalid parts array`);
          return;
        }

        const firstPart = msg.message.content.parts[0];
        if (!firstPart) {
          contentIssues.push(`Node ${nodeId}: Empty first part`);
          return;
        }

        if (typeof firstPart !== 'string') {
          contentIssues.push(`Node ${nodeId}: First part is not string (type: ${typeof firstPart})`);
          return;
        }

        if (firstPart.trim() === '') {
          contentIssues.push(`Node ${nodeId}: First part is whitespace only`);
          return;
        }

        validMessages++;
        if (messageSamples.length < 3) {
          const role = msg.message.author?.role || 'unknown';
          const truncated = firstPart.length > 100 ? firstPart.substring(0, 100) + '...' : firstPart;
          messageSamples.push(`${role}: ${truncated}`);
        }
      });

      return {
        hasMapping: true,
        totalNodes,
        validMessages,
        contentIssues,
        messageSamples,
        qualityScore: validMessages > 0 ? Math.round((validMessages / totalNodes) * 100) : 0
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Helper method to extract conversation preview content
  private extractConversationPreview(conversation: any): string {
    try {
      if (!conversation.mapping) {
        return 'No conversation content available';
      }

      // Extract first few messages to create a preview
      const messages: string[] = [];
      const messageEntries = Object.entries(conversation.mapping)
        .filter(([_, msg]: [string, any]) => {
          if (!msg.message || !msg.message.content || !msg.message.content.parts || !Array.isArray(msg.message.content.parts)) {
            return false;
          }
          const firstPart = msg.message.content.parts[0];
          const isValid = firstPart && typeof firstPart === 'string' && firstPart.trim() !== '';
          return isValid;
        })
        .sort((a, b) => {
          const timeA = (a[1] as any).message?.create_time || 0;
          const timeB = (b[1] as any).message?.create_time || 0;
          return timeA - timeB;
        })
        .slice(0, 3); // Take first 3 messages for preview

      for (const [_, msg] of messageEntries) {
        const messageData = msg as any;
        if (messageData.message && messageData.message.content && messageData.message.content.parts) {
          const content = messageData.message.content.parts[0];
          if (content && typeof content === 'string' && content.trim() !== '') {
            const role = messageData.message.author?.role || 'unknown';
            const truncatedContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
            messages.push(`${role}: ${truncatedContent}`);
          }
        }
      }

      if (messages.length === 0) {
        return 'No readable message content found';
      }

      const preview = messages.join('\n\n');
      return preview;
    } catch (error) {
      console.error(`Error extracting conversation preview for ${conversation.title}:`, error);
      return 'Error extracting conversation content';
    }
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
        const conversationIndex = conversations.map(conv => {
          // Analyze content quality for debugging
          const qualityAnalysis = this.analyzeContentQuality(conv);
          
          return {
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
            conversationPreview: this.extractConversationPreview(conv),
            sourceFilePath: filePath,
            contentQuality: qualityAnalysis
          };
        });
        
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

    // OpenAI API handler
    ipcMain.handle('call-openai-api', async (event, { apiKey, model, prompt }) => {
      try {
        // Type checking for apiKey
        if (!apiKey || typeof apiKey !== 'string') {
          console.error('❌ Invalid API key type:', typeof apiKey, 'Value:', apiKey);
          return { error: 'Invalid API key format. Please check your OpenAI API key.' };
        }
        
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are an expert at analyzing conversations and providing survey ratings. Always respond with the exact format requested.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.choices && response.data.choices[0]?.message?.content) {
          const content = response.data.choices[0].message.content;
          return { content };
        } else {
          throw new Error('No valid response from OpenAI API');
        }
      } catch (error) {
        console.error('❌ Main process: OpenAI API error:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            console.error('🔑 401 Unauthorized - API key issue');
            if (apiKey && typeof apiKey === 'string') {
              console.error('🔑 Sent API key length:', apiKey.length);
              console.error('🔑 Sent API key start:', apiKey.substring(0, 20));
            } else {
              console.error('🔑 API key is invalid:', typeof apiKey, apiKey);
            }
            return { error: 'Invalid API key. Please check your OpenAI API key.' };
          } else if (error.response?.status === 429) {
            return { error: 'Rate limit exceeded. Please try again later.' };
          } else if (error.response?.status && error.response.status >= 500) {
            return { error: 'OpenAI service is currently unavailable. Please try again later.' };
          } else {
            return { error: error.response?.data?.error?.message || error.message };
          }
        } else {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }
    });
  }
}
