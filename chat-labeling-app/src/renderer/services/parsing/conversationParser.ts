import { Conversation, ParsedConversation } from '../../types/conversation';
import { MessageExtractor } from './messageExtractor';
import { ValidationService } from './validationService';

export class ConversationParser {
  /**
   * Main entry point for parsing conversation files
   * Handles both single conversations and arrays of conversations
   * @param file The file to parse
   * @returns Array of parsed conversations
   */
  static async parseConversationFile(file: File): Promise<ParsedConversation[]> {
    try {
      // Read file content
      const content = await file.text();
      
      // Validate file content
      ValidationService.validateFileContent(content);
      
      // Parse JSON
      const data = JSON.parse(content);
      
      // Validate parsed data structure
      ValidationService.validateParsedData(data);
      
      // Handle array of conversations
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error('File contains no conversations');
        }
        
        return data.map((conversation, index) => 
          this.parseSingleConversation(conversation, `conversation_${index}`)
        );
      }
      
      // Handle single conversation
      if (typeof data === 'object' && data !== null) {
        return [this.parseSingleConversation(data)];
      }
      
      throw new Error('Invalid file format: expected conversation object or array');
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file: syntax error');
      }
      throw error;
    }
  }

  /**
   * Parses a single conversation object
   * @param conversation The conversation object to parse
   * @param fallbackId Optional fallback ID if conversation doesn't have one
   * @returns Parsed conversation object
   */
  private static parseSingleConversation(conversation: any, fallbackId?: string): ParsedConversation {
    // Validate conversation structure
    ValidationService.validateConversation(conversation);
    
    // Extract messages using established logic
    const messages = MessageExtractor.extractMessages(conversation);
    
    // Generate unique ID if not present
    const id = conversation.id || conversation.conversation_id || fallbackId || this.generateConversationId(conversation);
    
    // Extract metadata
    const metadata = {
      model_version: conversation.metadata?.model_version || conversation.model,
      conversation_length: messages.length,
      file_path: conversation.metadata?.file_path
    };
    
    return {
      id,
      title: conversation.title || 'Untitled Conversation',
      messages,
      metadata,
      originalData: conversation
    };
  }

  /**
   * Generates a unique ID for conversations without IDs
   * @param conversation The conversation object
   * @returns Generated unique ID
   */
  private static generateConversationId(conversation: any): string {
    const timestamp = Date.now();
    const titleHash = conversation.title 
      ? conversation.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
      : 'conv';
    
    return `${titleHash}_${timestamp}`;
  }

  /**
   * Parses conversation content from a string (for testing or direct content parsing)
   * @param content The JSON content string
   * @returns Array of parsed conversations
   */
  static parseConversationContent(content: string): ParsedConversation[] {
    try {
      // Validate file content
      ValidationService.validateFileContent(content);
      
      // Parse JSON
      const data = JSON.parse(content);
      
      // Validate parsed data structure
      ValidationService.validateParsedData(data);
      
      // Handle array of conversations
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error('Content contains no conversations');
        }
        
        return data.map((conversation, index) => 
          this.parseSingleConversation(conversation, `conversation_${index}`)
        );
      }
      
      // Handle single conversation
      if (typeof data === 'object' && data !== null) {
        return [this.parseSingleConversation(data)];
      }
      
      throw new Error('Invalid content format: expected conversation object or array');
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON content: syntax error');
      }
      throw error;
    }
  }

  /**
   * Converts parsed conversation to legacy format for backward compatibility
   * @param parsedConversation The parsed conversation
   * @returns Legacy conversation format
   */
  static toLegacyFormat(parsedConversation: ParsedConversation): any {
    return {
      id: parsedConversation.id,
      title: parsedConversation.title,
      modelVersion: parsedConversation.metadata.model_version || 'Unknown',
      conversationLength: parsedConversation.messages.length,
      createdAt: new Date(parsedConversation.metadata.file_path ? 0 : Date.now()).toISOString(),
      messageCount: parsedConversation.messages.length,
      filePath: parsedConversation.metadata.file_path || `conversations/${parsedConversation.id}.json`
    };
  }
}
