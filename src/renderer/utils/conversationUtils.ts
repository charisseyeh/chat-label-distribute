import { Conversation, ImportedConversation } from '../stores/conversationStore';

export const parseConversationFile = (fileContent: string): ImportedConversation => {
  try {
    const data = JSON.parse(fileContent);
    
    console.log('Parsing conversation file with structure:', {
      keys: Object.keys(data),
      dataType: typeof data,
      isArray: Array.isArray(data)
    });
    
    // Handle case where file contains an array of conversations
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('File contains an empty array of conversations');
      }
      if (data.length > 1) {
        throw new Error('File contains multiple conversations. Please import one conversation at a time.');
      }
      // Use the first conversation
      return parseConversationFile(JSON.stringify(data[0]));
    }
    
    // Handle case where file is a single conversation object
    if (typeof data !== 'object' || data === null) {
      throw new Error('File must contain a conversation object or array of conversations');
    }
    
    // Validate the structure - ChatGPT export format
    if (!data.title) {
      throw new Error('Missing required field: title');
    }
    
    if (!data.mapping) {
      throw new Error('Missing required field: mapping (conversation structure)');
    }
    
    if (!data.conversation_id) {
      throw new Error('Missing required field: conversation_id');
    }
    
    // Validate mapping structure
    if (typeof data.mapping !== 'object' || data.mapping === null) {
      throw new Error('Invalid mapping structure: must be an object');
    }
    
    // Check if mapping has at least one node
    const mappingKeys = Object.keys(data.mapping);
    if (mappingKeys.length === 0) {
      throw new Error('Mapping is empty: no conversation nodes found');
    }
    
    // Validate that mapping contains valid nodes
    for (const [nodeId, node] of Object.entries(data.mapping)) {
      if (!node || typeof node !== 'object') {
        throw new Error(`Invalid node structure at ${nodeId}`);
      }
      
      const nodeObj = node as any;
      if (!nodeObj.id || nodeObj.id !== nodeId) {
        throw new Error(`Invalid node ID at ${nodeId}`);
      }
      
      // Check if node has a message (some nodes might be empty)
      if (nodeObj.message) {
        if (!nodeObj.message.content || !nodeObj.message.role) {
          throw new Error(`Invalid message structure at node ${nodeId}`);
        }
      }
    }
    
    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid JSON format in conversation file');
    }
    if (err instanceof Error) {
      throw err; // Re-throw validation errors
    }
    throw new Error('Failed to parse conversation file: unknown error');
  }
};

export const processImportedConversation = (imported: ImportedConversation): Conversation => {
  // Count messages
  const messageCount = Object.values(imported.mapping).filter(
    node => node.message && node.message.content
  ).length;

  // Calculate conversation length (approximate)
  const conversationLength = Math.ceil(messageCount / 2); // Rough estimate

  // Extract model version if available
  const modelVersion = imported.model || 'Unknown';

  return {
    id: imported.conversation_id,
    title: imported.title,
    modelVersion,
    conversationLength,
    createdAt: new Date(imported.create_time * 1000).toISOString(),
    messageCount,
    filePath: `conversations/${imported.conversation_id}.json` // Placeholder for Electron file paths
  };
};

export const extractMessagesFromConversation = (imported: ImportedConversation) => {
  const messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    create_time: number;
  }> = [];
  
  Object.values(imported.mapping).forEach((node) => {
    if (node.message && node.message.content) {
      messages.push({
        id: node.id,
        role: node.message.role as 'user' | 'assistant' | 'system',
        content: node.message.content.parts[0]?.content || '',
        create_time: node.message.create_time
      });
    }
  });
  
  // Sort by creation time
  return messages.sort((a, b) => a.create_time - b.create_time);
};
