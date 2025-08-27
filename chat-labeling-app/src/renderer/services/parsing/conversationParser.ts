import { ParsedConversation } from '../../types/conversation';
import { Conversation as StoreConversation } from '../../stores/conversationStore';
import { MessageExtractor } from './messageExtractor';
import { ValidationService } from './validationService';

export class ConversationParser {
  /**
   * Parse a conversation file and return parsed conversations
   * @param file The file to read and parse
   * @returns Array of parsed conversations
   */
  static async parseConversationFile(file: File): Promise<ParsedConversation[]> {
    try {
      const content = await file.text();
      return this.parseConversationContent(content);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file');
      }
      throw new Error('Failed to read file');
    }
  }

  /**
   * Parse conversation content from a JSON string
   * @param content The JSON string content to parse
   * @returns Array of parsed conversations
   */
  static parseConversationContent(content: string): ParsedConversation[] {
    try {
      const data = JSON.parse(content);
      
      // Handle both single conversation and array of conversations
      const conversations = Array.isArray(data) ? data : [data];
      
      return conversations.map(conversation => {
        // Validate the conversation structure
        ValidationService.validateConversation(conversation);
        
        // Extract messages using the MessageExtractor
        const messages = MessageExtractor.extractMessages(conversation);
        
        // Create parsed conversation
        const parsedConversation: ParsedConversation = {
          id: conversation.id || conversation.conversation_id || `conv_${Date.now()}`,
          title: conversation.title,
          messages,
          metadata: {
            model_version: conversation.model || conversation.metadata?.model_version,
            conversation_length: messages.length,
            file_path: conversation.metadata?.file_path
          },
          originalData: conversation
        };
        
        return parsedConversation;
      });
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON content');
      }
      if (error instanceof Error) {
        throw new Error(`Failed to parse conversation: ${error.message}`);
      }
      throw new Error('Failed to parse conversation content');
    }
  }

  /**
   * Convert a parsed conversation to the store format for backward compatibility
   * @param parsedConversation The parsed conversation to convert
   * @returns Store conversation format
   */
  static toLegacyFormat(parsedConversation: ParsedConversation): StoreConversation {
    return {
      id: parsedConversation.id,
      title: parsedConversation.title,
      modelVersion: parsedConversation.metadata.model_version || 'Unknown',
      conversationLength: parsedConversation.messages.length,
      createdAt: new Date(parsedConversation.messages[0]?.timestamp || Date.now()).toISOString(),
      messageCount: parsedConversation.messages.length,
      filePath: parsedConversation.metadata.file_path || ''
    };
  }

  /**
   * Simple JSON file reader - kept for backward compatibility
   * @param file The file to read
   * @returns The raw JSON data
   */
  static async readJsonFile(file: File): Promise<any> {
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file');
      }
      throw new Error('Failed to read file');
    }
  }
}
