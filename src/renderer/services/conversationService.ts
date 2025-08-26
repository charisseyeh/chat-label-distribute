export interface ConversationData {
  id: string;
  title: string;
  createTime?: number;
  createdAt?: string;
  messageCount: number;
  model?: string;
  modelVersion?: string;
  conversationPreview?: string;
  aiRelevancy?: {
    category: 'relevant' | 'not-relevant';
    explanation: string;
  };
}

export interface RawConversationData {
  conversation_id?: string;
  id?: string;
  title?: string;
  create_time?: number;
  update_time?: number;
  model?: string;
  mapping?: Record<string, any>;
}

export class ConversationService {
  // Simple method to get conversation index (titles only) for selection list
  async getConversationIndex(filePath: string): Promise<ConversationData[]> {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.getConversationIndex(filePath);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get conversation index');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error getting conversation index:', error);
      throw new Error(`Failed to get conversation index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Simple method to get a single conversation
  async getSingleConversation(filePath: string, conversationId: string): Promise<RawConversationData | null> {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.readSingleConversation(filePath, conversationId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to read single conversation');
      }
      
      return result.found ? result.data : null;
    } catch (error) {
      console.error('Error getting single conversation:', error);
      throw new Error(`Failed to get single conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to format conversation title for display
  formatConversationTitle(title: string): string {
    if (!title || title === 'Untitled Conversation') {
      return 'Untitled Conversation';
    }
    
    // Truncate long titles
    if (title.length > 60) {
      return title.substring(0, 60) + '...';
    }
    
    return title;
  }

  // Helper method to format timestamp
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
}
