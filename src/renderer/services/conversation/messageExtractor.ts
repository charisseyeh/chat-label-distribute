import { ParsedMessage } from '../../types/conversation';

export class MessageExtractor {
  /**
   * Simple method to get raw conversation data - no complex extraction
   * @param conversation The conversation object
   * @returns The raw conversation data
   */
  static getRawData(conversation: any): any {
    return conversation;
  }
}
