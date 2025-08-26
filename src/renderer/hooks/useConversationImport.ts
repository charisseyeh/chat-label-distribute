import { useState } from 'react';
import { Conversation, ImportedConversation } from '../stores/conversationStore';
import { processImportedConversation, parseConversationFile } from '../utils/conversationUtils';

export const useConversationImport = (onConversationAdded: (conversation: Conversation) => void) => {
  const [importing, setImporting] = useState(false);

  const importConversationFromFile = async (file: File) => {
    try {
      setImporting(true);

      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Read file content
      const fileContent = await file.text();
      console.log('File content length:', fileContent.length);
      console.log('File content preview:', fileContent.substring(0, 200) + '...');
      
      // Try to parse as JSON first to see the raw structure
      let rawData;
      try {
        rawData = JSON.parse(fileContent);
        console.log('Raw JSON structure:', {
          keys: Object.keys(rawData),
          hasTitle: !!rawData.title,
          hasMapping: !!rawData.mapping,
          hasConversationId: !!rawData.conversation_id,
          mappingType: typeof rawData.mapping,
          mappingKeys: rawData.mapping ? Object.keys(rawData.mapping) : 'N/A'
        });
      } catch (jsonErr) {
        console.error('JSON parsing failed:', jsonErr);
        throw new Error('File is not valid JSON format');
      }
      
      // Parse the conversation file
      const importedConversation = parseConversationFile(fileContent);
      console.log('Parsed conversation:', importedConversation);
      
      // Process and convert to our format
      const newConversation = processImportedConversation(importedConversation);
      console.log('Processed conversation:', newConversation);
      
      // Store the full conversation data for later use
      localStorage.setItem(`conversation_${newConversation.id}`, fileContent);
      
      // Notify parent component
      onConversationAdded(newConversation);
      
      console.log('Successfully imported conversation:', newConversation.title);
      
    } catch (err) {
      console.error('Detailed error during import:', err);
      throw err;
    } finally {
      setImporting(false);
    }
  };

  const createTestConversation = () => {
    const mockConversation: ImportedConversation = {
      title: 'Sample Conversation 1',
      create_time: Date.now() / 1000,
      update_time: Date.now() / 1000,
      mapping: {
        'node1': {
          id: 'node1',
          message: {
            content: {
              parts: [{ content: 'Hello!' }],
            },
            role: 'user',
            create_time: Date.now() / 1000,
          },
          parent: undefined,
          children: ['node2'],
        },
        'node2': {
          id: 'node2',
          message: {
            content: {
              parts: [{ content: 'Hi there!' }],
            },
            role: 'assistant',
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

    const newConversation = processImportedConversation(mockConversation);
    localStorage.setItem(`conversation_${newConversation.id}`, JSON.stringify(mockConversation));
    onConversationAdded(newConversation);
    
    console.log('Successfully loaded test conversation:', newConversation.title);
  };

  const loadTestFileFromProject = async () => {
    try {
      setImporting(true);
      
      console.log('Loading test file from project directory...');
      
      // Try to fetch the test file from the public directory
      const response = await fetch('/test-conversation.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch test file: ${response.status} ${response.statusText}`);
      }
      
      const fileContent = await response.text();
      console.log('Test file content length:', fileContent.length);
      console.log('Test file content preview:', fileContent.substring(0, 200) + '...');
      
      // Parse the conversation file
      const importedConversation = parseConversationFile(fileContent);
      console.log('Parsed test conversation:', importedConversation);
      
      // Process and convert to our format
      const newConversation = processImportedConversation(importedConversation);
      console.log('Processed test conversation:', newConversation);
      
      // Store the full conversation data for later use
      localStorage.setItem(`conversation_${newConversation.id}`, fileContent);
      
      // Notify parent component
      onConversationAdded(newConversation);
      
      console.log('Successfully loaded test conversation from file:', newConversation.title);
      
    } catch (err) {
      console.error('Error loading test file:', err);
      throw err;
    } finally {
      setImporting(false);
    }
  };

  return {
    importing,
    importConversationFromFile,
    createTestConversation,
    loadTestFileFromProject
  };
};
