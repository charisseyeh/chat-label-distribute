export interface Conversation {
  id: string;
  title: string;
  create_time: number;
  mapping: Record<string, ConversationNode>;
  metadata?: ConversationMetadata;
}

export interface ConversationNode {
  id: string;
  message?: {
    author: { role: 'user' | 'assistant' | 'system' };
    content: {
      content_type: 'text';
      parts: string[];
    };
    create_time: number;
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
  sequence_order: number;
  timestamp: number;
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
