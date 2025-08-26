import { ParsedMessage } from '../../types/conversation';

export class MessageExtractor {
  /**
   * Converts a timestamp to a number (handles both ISO strings and numbers)
   * @param timestamp The timestamp to convert
   * @returns Unix timestamp in milliseconds
   */
  private static normalizeTimestamp(timestamp: any): number {
    if (timestamp === null || timestamp === undefined) {
      return Date.now(); // Fallback to current time
    }
    
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return Date.now(); // Fallback if invalid date string
      }
      return date.getTime();
    } else if (typeof timestamp === 'number') {
      // If it's already a Unix timestamp, convert to milliseconds if it's in seconds
      return timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
    }
    
    return Date.now(); // Fallback to current time for any other type
  }

  /**
   * Extracts messages from a conversation using the established parsing logic
   * @param conversation The conversation object to extract messages from
   * @returns Array of parsed messages sorted chronologically
   */
  static extractMessages(conversation: any): ParsedMessage[] {
    if (!conversation.mapping) {
      return [];
    }

    // Filter valid text messages with content
    const allNodes = Object.entries(conversation.mapping)
      .filter(([nodeId, node]: [string, any]) => {
        if (!node.message || !node.message.content) return false;
        
        // Check if it's a text message
        if (node.message.content.content_type !== 'text') return false;
        
        // Check if it has content in parts
        const hasContent = node.message.content.parts?.some((part: any) => 
          part && typeof part === 'string' && part.trim() !== ''
        );
        
        return hasContent;
      })
      .map(([nodeId, node]: [string, any]) => ({
        nodeId,
        message: node.message!
      }));

    // Sort chronologically
    allNodes.sort((a, b) => {
      const timeA = this.normalizeTimestamp(a.message.create_time);
      const timeB = this.normalizeTimestamp(b.message.create_time);
      return timeA - timeB;
    });

    // Extract structured message data
    return allNodes.map((node, index) => ({
      id: node.nodeId,
      role: node.message.author?.role || 'user',
      content: node.message.content.parts?.find((part: any) => 
        part && typeof part === 'string' && part.trim() !== ''
      ) || '',
      sequence_order: index + 1,
      timestamp: this.normalizeTimestamp(node.message.create_time)
    }));
  }

  /**
   * Alternative extraction method for export purposes
   * This method preserves more metadata and handles different content structures
   */
  static extractMessagesForExport(conversation: any): ParsedMessage[] {
    if (!conversation.mapping) {
      return [];
    }

    const messages: ParsedMessage[] = [];
    let sequenceOrder = 1;

    // Process nodes in chronological order
    const sortedNodes: Array<[string, any]> = Object.entries(conversation.mapping)
      .filter(([nodeId, node]: [string, any]) => 
        node.message && 
        node.message.content && 
        node.message.content.content_type === 'text'
      )
      .sort((a, b) => {
        const timeA = this.normalizeTimestamp(a[1].message?.create_time);
        const timeB = this.normalizeTimestamp(b[1].message?.create_time);
        return timeA - timeB;
      });

    for (const [nodeId, node] of sortedNodes) {
      if (node.message && node.message.content) {
        // Find the first part with content
        const content = node.message.content.parts?.find((part: any) => 
          part && typeof part === 'string' && part.trim() !== ''
        ) || '';
        
        // Skip messages with no content
        if (content.trim() === '') {
          continue;
        }

        messages.push({
          id: nodeId,
          role: node.message.author?.role || 'user',
          content: content,
          sequence_order: sequenceOrder++,
          timestamp: this.normalizeTimestamp(node.message.create_time)
        });
      }
    }

    return messages;
  }

  /**
   * Extracts messages from legacy conversation format
   * @param legacyConversation The legacy conversation object
   * @returns Array of parsed messages
   */
  static extractMessagesFromLegacy(legacyConversation: any): ParsedMessage[] {
    if (!legacyConversation.mapping) {
      return [];
    }

    const messages: ParsedMessage[] = [];
    let sequenceOrder = 1;

    Object.entries(legacyConversation.mapping).forEach(([nodeId, node]: [string, any]) => {
      if (node.message && node.message.content) {
        const content = node.message.content.parts?.[0]?.content || '';
        
        if (content.trim() !== '') {
          messages.push({
            id: nodeId,
            role: node.message.role as 'user' | 'assistant' | 'system',
            content: content,
            sequence_order: sequenceOrder++,
            timestamp: this.normalizeTimestamp(node.message.create_time)
          });
        }
      }
    });

    // Sort by creation time
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }
}
