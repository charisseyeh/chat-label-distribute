export interface ConversationData {
  id: string;
  title: string;
  createTime: number;
  updateTime: number;
  model?: string;
  messageCount: number;
  firstMessage?: string;
  conversationPreview?: string; // New field for first 200 characters of conversation
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
        conversations = jsonData.map((conv: RawConversationData) => this.extractConversationData(conv));
      } else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
        conversations = jsonData.conversations.map((conv: RawConversationData) => this.extractConversationData(conv));
      } else if (jsonData.conversation_id) {
        conversations = [this.extractConversationData(jsonData as RawConversationData)];
      } else {
        console.error('ConversationService: Unsupported format - jsonData:', jsonData);
        throw new Error('Unsupported conversation file format');
      }
      
      return conversations;
    } catch (error) {
      console.error('ConversationService: Error reading conversation file:', error);
      throw new Error(`Failed to read conversation file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractConversationData(conv: RawConversationData): ConversationData {
    // Extract basic conversation information
    const id = conv.conversation_id || conv.id || `conv_${Date.now()}`;
    const title = conv.title || 'Untitled Conversation';
    const createTime = conv.create_time || Date.now();
    const updateTime = conv.update_time || createTime;
    const model = conv.model || 'unknown';
    
    // Count messages and extract conversation content if mapping exists
    let messageCount = 0;
    let firstMessage = '';
    let conversationPreview = '';
    
    if (conv.mapping) {
      const messages = Object.values(conv.mapping).filter((msg: any) => msg.message);
      messageCount = messages.length;
      
      // Extract first user message if available
      const firstUserMessage = messages.find((msg: any) => msg.message?.author?.role === 'user');
      if (firstUserMessage?.message?.content?.parts?.[0]?.text) {
        firstMessage = firstUserMessage.message.content.parts[0].text;
      }
      
      // Extract first 200 characters from all messages combined
      const allMessageTexts: string[] = [];
      messages.forEach((msg: any) => {
        if (msg.message?.content?.parts?.[0]?.text) {
          allMessageTexts.push(msg.message.content.parts[0].text);
        }
      });
      
      const fullConversationText = allMessageTexts.join(' ');
      conversationPreview = fullConversationText.substring(0, 200);
      if (fullConversationText.length > 200) {
        conversationPreview += '...';
      }
    }
    
    const extractedData = {
      id,
      title,
      createTime,
      updateTime,
      model,
      messageCount,
      firstMessage,
      conversationPreview
    };
    
    return extractedData;
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

  // Filter conversations by AI relevancy
  filterByAIRelevancy(conversations: ConversationData[], relevancyResults: Array<{category: 'relevant' | 'not-relevant', explanation: string}>): ConversationData[] {
    if (!relevancyResults || relevancyResults.length === 0) {
      return conversations;
    }

    return conversations.map((conv, index) => ({
      ...conv,
      aiRelevancy: relevancyResults[index] || undefined
    })).filter(conv => conv.aiRelevancy?.category === 'relevant');
  }

  // Get only relevant conversations
  getRelevantConversations(conversations: ConversationData[]): ConversationData[] {
    return conversations.filter(conv => conv.aiRelevancy?.category === 'relevant');
  }

  // Get only non-relevant conversations
  getNonRelevantConversations(conversations: ConversationData[]): ConversationData[] {
    return conversations.filter(conv => conv.aiRelevancy?.category === 'not-relevant');
  }
}
