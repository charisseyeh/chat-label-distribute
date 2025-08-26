export interface Conversation {
  id?: string; // Make ID optional since some conversations might not have it
  title: string;
  create_time?: number; // Make optional since some might not have it
  mapping: Record<string, ConversationNode>;
  metadata?: ConversationMetadata;
}

export interface ConversationNode {
  id?: string; // Make ID optional since some nodes might not have it
  message?: {
    author?: { role: 'user' | 'assistant' | 'system' }; // Make author optional
    role?: 'user' | 'assistant' | 'system'; // Legacy format support
    content: {
      content_type?: string; // Make content_type optional and accept any type
      parts: Array<string | { content: string }>; // Support both string and object parts
    };
    create_time?: number; // Make optional
  };
  parent?: string;
  children?: string[];
}

export interface ConversationMetadata {
  model_version?: string;
  conversation_length?: number;
  file_path?: string;
}

export interface ParsedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sequence_order?: number; // Make optional since we set it dynamically
}

export interface ParsedConversation {
  id: string;
  title: string;
  messages: ParsedMessage[];
  metadata: ConversationMetadata;
  originalData: Conversation;
}

// Legacy types for backward compatibility
export interface ImportedConversation {
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, {
    id: string;
    message?: {
      content: {
        parts: Array<{
          content: string;
        }>;
      };
      role: string;
      create_time: number;
    };
    parent?: string;
    children?: string[];
  }>;
  current_node: string;
  conversation_id: string;
  model?: string;
}

export interface LegacyConversation {
  id: string;
  title: string;
  modelVersion?: string;
  conversationLength: number;
  createdAt: string;
  messageCount: number;
  filePath: string;
}
