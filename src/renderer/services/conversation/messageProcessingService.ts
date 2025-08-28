export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
}

/**
 * Extracts and processes messages from conversation mapping data
 * @param mapping - The conversation mapping object from the API response
 * @returns Array of processed messages
 */
export const extractMessagesFromMapping = (mapping: Record<string, any>): Message[] => {
  try {
    const messages: Message[] = [];
    
    // Convert mapping to array and sort by create_time if available
    const messageEntries = Object.entries(mapping)
      .filter(([_, msg]) => {
        if (!msg.message || !msg.message.content || !msg.message.content.parts || !Array.isArray(msg.message.content.parts)) {
          return false;
        }
        const firstPart = msg.message.content.parts[0];
        return firstPart && typeof firstPart === 'string' && firstPart.trim() !== '';
      })
      .sort((a, b) => {
        const timeA = a[1].message?.create_time || 0;
        const timeB = b[1].message?.create_time || 0;
        return timeA - timeB;
      });
    
    messageEntries.forEach(([id, msg]) => {
      if (msg.message) {
        // Get content from parts array directly, not from .text property
        const content = msg.message.content.parts[0];
        if (content && typeof content === 'string' && content.trim() !== '') {
          messages.push({
            id: id,
            role: msg.message.author.role,
            content: content,
            create_time: msg.message.create_time || Date.now() / 1000
          });
        }
      }
    });
    
    return messages;
  } catch (error) {
    console.error('Error extracting messages from mapping:', error);
    return [];
  }
};

/**
 * Gets display name for message role
 * @param role - Message role from API
 * @returns Human-readable role name
 */
export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'user': return 'You';
    case 'assistant': return 'Assistant';
    case 'system': return 'System';
    default: return role;
  }
};

/**
 * Gets CSS classes for message role styling
 * @param role - Message role from API
 * @returns CSS classes for styling
 */
export const getRoleColor = (role: string) => {
  switch (role) {
    case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'assistant': return 'bg-green-100 text-green-800 border-green-200';
    case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
