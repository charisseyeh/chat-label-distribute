import { Conversation } from '../../types/conversation';

export class ValidationService {
  /**
   * Validates conversation structure and throws descriptive errors for invalid data
   * @param conversation The conversation object to validate
   * @throws Error with descriptive message if validation fails
   */
  static validateConversation(conversation: any): asserts conversation is Conversation {
    if (!conversation || typeof conversation !== 'object') {
      throw new Error('Invalid conversation: must be an object');
    }

    if (!conversation.title || typeof conversation.title !== 'string') {
      throw new Error('Invalid conversation: missing or invalid title');
    }

    if (!conversation.mapping || typeof conversation.mapping !== 'object') {
      throw new Error('Invalid conversation: missing or invalid mapping');
    }

    // Validate mapping structure
    if (conversation.mapping === null) {
      throw new Error('Invalid conversation: mapping cannot be null');
    }

    // Check if mapping has at least one node
    const mappingKeys = Object.keys(conversation.mapping);
    if (mappingKeys.length === 0) {
      throw new Error('Invalid conversation: mapping is empty - no conversation nodes found');
    }

    // Validate that mapping contains valid nodes
    for (const [nodeId, node] of Object.entries(conversation.mapping)) {
      if (!node || typeof node !== 'object') {
        throw new Error(`Invalid node structure at ${nodeId}: must be an object`);
      }

      const nodeObj = node as any;
      
      // Validate node ID
      if (!nodeObj.id || nodeObj.id !== nodeId) {
        throw new Error(`Invalid node ID at ${nodeId}: ID mismatch`);
      }

      // Check if node has a message (some nodes might be empty)
      if (nodeObj.message) {
        this.validateMessage(nodeObj.message, nodeId);
      }
    }

    // Validate at least one message exists
    const hasValidMessages = Object.values(conversation.mapping).some(node => 
      node?.message?.content?.content_type === 'text' &&
      node.message.content.parts?.[0]?.trim() !== ''
    );

    if (!hasValidMessages) {
      throw new Error('Invalid conversation: no valid messages found');
    }
  }

  /**
   * Validates individual message structure
   * @param message The message object to validate
   * @param nodeId The node ID for error context
   * @throws Error with descriptive message if validation fails
   */
  static validateMessage(message: any, nodeId: string): void {
    if (!message.content || typeof message.content !== 'object') {
      throw new Error(`Invalid message structure at node ${nodeId}: missing or invalid content`);
    }

    if (!message.content.content_type || message.content.content_type !== 'text') {
      throw new Error(`Invalid message structure at node ${nodeId}: unsupported content type`);
    }

    if (!Array.isArray(message.content.parts) || message.content.parts.length === 0) {
      throw new Error(`Invalid message structure at node ${nodeId}: missing or empty parts array`);
    }

    // Validate that at least one part has content
    const hasContent = message.content.parts.some((part: any) => 
      part && typeof part === 'string' && part.trim() !== ''
    );

    if (!hasContent) {
      throw new Error(`Invalid message structure at node ${nodeId}: no content found in parts`);
    }

    // Validate author role if present
    if (message.author && message.author.role) {
      const validRoles = ['user', 'assistant', 'system'];
      if (!validRoles.includes(message.author.role)) {
        throw new Error(`Invalid message structure at node ${nodeId}: invalid author role`);
      }
    }

    // Validate create_time if present
    if (message.create_time !== undefined) {
      if (typeof message.create_time !== 'number' || message.create_time < 0) {
        throw new Error(`Invalid message structure at node ${nodeId}: invalid create_time`);
      }
    }
  }

  /**
   * Validates file content before parsing
   * @param content The file content to validate
   * @throws Error if content is invalid
   */
  static validateFileContent(content: string): void {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid file: content must be a string');
    }

    if (content.trim().length === 0) {
      throw new Error('Invalid file: content is empty');
    }

    // Check if content looks like JSON
    const trimmed = content.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      throw new Error('Invalid file: content does not appear to be JSON format');
    }
  }

  /**
   * Validates parsed data structure
   * @param data The parsed JSON data to validate
   * @throws Error if data structure is invalid
   */
  static validateParsedData(data: any): void {
    if (data === null || data === undefined) {
      throw new Error('Invalid file: parsed data is null or undefined');
    }

    if (typeof data !== 'object') {
      throw new Error('Invalid file: parsed data must be an object or array');
    }

    // Handle array case
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Invalid file: contains no conversations');
      }
      
      // Validate each conversation in the array
      data.forEach((conversation, index) => {
        try {
          this.validateConversation(conversation);
        } catch (error) {
          throw new Error(`Invalid conversation at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
      
      return;
    }

    // Handle single conversation case
    this.validateConversation(data);
  }
}
