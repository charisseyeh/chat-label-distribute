import { Conversation, ParsedConversation } from '../../../types/conversation';
import { MessageExtractor } from './messageExtractor';
// import { ValidationService } from './validationService'; // Comment out validation import

export class ConversationParser {
  /**
   * Simple JSON file reader - no complex parsing, just read the file
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
