export interface ConversationData {
  id: string;
  title: string;
  createTime: number;
  updateTime: number;
  model?: string;
  messageCount: number;
}

export class ConversationService {
  async getConversationsFromFile(filePath: string): Promise<ConversationData[]> {
    try {
      // Use the Electron API to read the file
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.readConversationsFromFile(filePath);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to read conversations');
      }

      // Process the raw JSON data to extract conversations
      const jsonData = result.data;
      let conversations: ConversationData[] = [];
      
      if (Array.isArray(jsonData)) {
        // If it's an array of conversations
        conversations = jsonData.map(conv => this.extractConversationData(conv));
      } else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
        // If it's wrapped in a conversations property
        conversations = jsonData.conversations.map(conv => this.extractConversationData(conv));
      } else if (jsonData.conversation_id) {
        // If it's a single conversation
        conversations = [this.extractConversationData(jsonData)];
      } else {
        throw new Error('Unsupported conversation file format');
      }

      return conversations;
    } catch (error) {
      console.error('Error reading conversation file:', error);
      throw new Error(`Failed to read conversation file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractConversationData(conv: Record<string, any>): ConversationData {
    // Extract basic conversation information
    const id = conv.conversation_id || conv.id || `conv_${Date.now()}`;
    const title = conv.title || 'Untitled Conversation';
    const createTime = conv.create_time || Date.now();
    const updateTime = conv.update_time || createTime;
    const model = conv.model || 'unknown';
    
    // Count messages if mapping exists
    let messageCount = 0;
    if (conv.mapping) {
      messageCount = Object.values(conv.mapping).filter((msg: any) => msg.message).length;
    }
    
    return {
      id,
      title,
      createTime,
      updateTime,
      model,
      messageCount
    };
  }

  // Helper method to format conversation data for display
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
