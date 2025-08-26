import { useState } from 'react';
import { Conversation } from '../stores/conversationStore';
import { ConversationParser } from '../services/parsing';
import { ParsedConversation } from '../types/conversation';

export const useConversationImport = (onConversationAdded: (conversation: Conversation) => void) => {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importConversationFromFile = async (file: File) => {
    try {
      setImporting(true);
      setImportError(null);

      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Parse the file using the new parsing service
      const parsedConversations = await ConversationParser.parseConversationFile(file);
      console.log(`Successfully parsed ${parsedConversations.length} conversation(s):`, parsedConversations);
      
      // Process and add each conversation
      for (const parsedConversation of parsedConversations) {
        // Convert to legacy format for backward compatibility
        const legacyConversation = ConversationParser.toLegacyFormat(parsedConversation);
        
        // Store the full conversation data for later use
        localStorage.setItem(`conversation_${legacyConversation.id}`, JSON.stringify(parsedConversation.originalData));
        
        // Notify parent component
        onConversationAdded(legacyConversation);
        
        console.log(`Successfully imported conversation: ${legacyConversation.title}`);
      }

      // Show success message
      if (parsedConversations.length === 1) {
        console.log(`Successfully imported 1 conversation: ${parsedConversations[0].title}`);
      } else {
        console.log(`Successfully imported ${parsedConversations.length} conversations`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setImportError(errorMessage);
      console.error('Detailed error during import:', err);
      throw err;
    } finally {
      setImporting(false);
    }
  };

  const createTestConversation = () => {
    const mockConversation = {
      title: 'Sample Conversation 1',
      create_time: Date.now() / 1000,
      update_time: Date.now() / 1000,
      mapping: {
        'node1': {
          id: 'node1',
          message: {
            author: { role: 'user' as const },
            content: {
              content_type: 'text' as const,
              parts: ['Hello!']
            },
            create_time: Date.now() / 1000,
          },
          parent: undefined,
          children: ['node2'],
        },
        'node2': {
          id: 'node2',
          message: {
            author: { role: 'assistant' as const },
            content: {
              content_type: 'text' as const,
              parts: ['Hi there!']
            },
            create_time: Date.now() / 1000,
          },
          parent: 'node1',
          children: [],
        },
      },
      current_node: 'node1',
      conversation_id: 'test-id-1',
      model: 'GPT-4',
    };

    try {
      // Use the new parser to parse the mock conversation
      const parsedConversations = ConversationParser.parseConversationContent(JSON.stringify(mockConversation));
      const parsedConversation = parsedConversations[0];
      
      // Convert to legacy format
      const legacyConversation = ConversationParser.toLegacyFormat(parsedConversation);
      
      // Store the full conversation data
      localStorage.setItem(`conversation_${legacyConversation.id}`, JSON.stringify(mockConversation));
      
      // Notify parent component
      onConversationAdded(legacyConversation);
      
      console.log('Successfully loaded test conversation:', legacyConversation.title);
    } catch (error) {
      console.error('Error creating test conversation:', error);
      setImportError('Failed to create test conversation');
    }
  };

  const loadTestFileFromProject = async () => {
    try {
      setImporting(true);
      setImportError(null);
      
      console.log('Loading test file with ChatGPT format...');
      
      // Use inline test data instead of fetching from server
      const testConversationData = {
        "version": "v1",
        "id": "conversation-test-123",
        "title": "Test ChatGPT Conversation",
        "create_time": "2025-08-25T19:02:45.000Z",
        "update_time": "2025-08-25T19:15:12.000Z",
        "mapping": {
          "uuid-1": {
            "id": "uuid-1",
            "message": {
              "id": "message-uuid-1",
              "author": {
                "role": "user",
                "name": null
              },
              "create_time": "2025-08-25T19:02:45.000Z",
              "content": {
                "content_type": "text",
                "parts": ["Hello! How are you today?"]
              },
              "status": "finished_successfully"
            },
            "parent": null,
            "children": ["uuid-2"]
          },
          "uuid-2": {
            "id": "uuid-2",
            "message": {
              "id": "message-uuid-2",
              "author": {
                "role": "assistant",
                "name": null
              },
              "create_time": "2025-08-25T19:03:15.000Z",
              "content": {
                "content_type": "text",
                "parts": ["Hi there! I'm doing well, thank you for asking. How about you?"]
              },
              "status": "finished_successfully"
            },
            "parent": "uuid-1",
            "children": []
          }
        },
        "moderation_results": [],
        "current_node": "uuid-2"
      };
      
      const fileContent = JSON.stringify(testConversationData);
      console.log('Test file content length:', fileContent.length);
      
      // Parse the conversation content using the new parser
      const parsedConversations = ConversationParser.parseConversationContent(fileContent);
      console.log('Parsed test conversations:', parsedConversations);
      
      // Process and add each conversation
      for (const parsedConversation of parsedConversations) {
        // Convert to legacy format
        const legacyConversation = ConversationParser.toLegacyFormat(parsedConversation);
        
        // Store the full conversation data
        localStorage.setItem(`conversation_${legacyConversation.id}`, fileContent);
        
        // Notify parent component
        onConversationAdded(legacyConversation);
        
        console.log(`Successfully loaded test conversation: ${legacyConversation.title}`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setImportError(errorMessage);
      console.error('Error loading test file:', err);
      throw err;
    } finally {
      setImporting(false);
    }
  };

  const clearError = () => setImportError(null);

  return {
    importing,
    importError,
    importConversationFromFile,
    createTestConversation,
    loadTestFileFromProject,
    clearError
  };
};
