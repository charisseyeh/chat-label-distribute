import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { useConversationImport } from '../../hooks/useConversationImport';
import { processImportedConversation, parseConversationFile } from '../../utils/conversationUtils';

const ConversationList: React.FC = () => {
  const { 
    conversations, 
    loading, 
    error, 
    addConversation, 
    clearError 
  } = useConversationStore();
  
  const { importing, importConversationFromFile } = useConversationImport(addConversation);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      console.log('Starting import of file:', file.name);
      await importConversationFromFile(file);
      console.log('Import completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import conversation';
      setImportError(errorMessage);
      console.error('Error importing conversation:', err);
    } finally {
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleImportConversation = () => {
    // Create a proper file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // Add event listener
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileImport({ target } as React.ChangeEvent<HTMLInputElement>);
      }
    });
    
    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(fileInput);
    }, 1000);
  };

  const loadTestConversation = () => {
    const mockConversation = {
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
    addConversation(newConversation);
    
    // Store the full conversation data for later use (consistent with import)
    localStorage.setItem(`conversation_${newConversation.id}`, JSON.stringify(mockConversation));
    
    console.log('Successfully loaded test conversation:', newConversation.title);
  };

  const loadTestFileFromProject = async () => {
    try {
      console.log('Loading test file from project directory...');
      
      // Try to fetch the test file from the public directory
      const response = await fetch('/test-conversation.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch test file: ${response.status} ${response.statusText}`);
      }
      
      const fileContent = await response.text();
      console.log('Test file content length:', fileContent.length);
      
      // Parse the conversation file
      const importedConversation = parseConversationFile(fileContent);
      console.log('Parsed test conversation:', importedConversation);
      
      // Process and convert to our format
      const newConversation = processImportedConversation(importedConversation);
      console.log('Processed test conversation:', newConversation);
      
      // Store the full conversation data for later use
      localStorage.setItem(`conversation_${newConversation.id}`, fileContent);
      
      // Add to store
      addConversation(newConversation);
      
      console.log('Successfully loaded test conversation from file:', newConversation.title);
      
    } catch (err) {
      console.error('Error loading test file:', err);
      setImportError(err instanceof Error ? err.message : 'Failed to load test file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  const displayError = error || importError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conversations</h1>
          <p className="text-muted-foreground mt-2">
            Manage and analyze your imported conversation data
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground mr-4">
            <p>Expected format: ChatGPT export JSON</p>
            <p>File should contain: title, mapping, conversation_id</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {displayError && (
              <div className="text-sm text-error bg-error/10 px-3 py-2 rounded border border-error/20">
                {displayError}
                <button 
                  onClick={() => { clearError(); setImportError(null); }}
                  className="ml-2 text-error hover:text-error/80 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleImportConversation}
                disabled={importing}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Conversation'}
              </button>
              
              <button 
                onClick={loadTestConversation}
                className="btn-secondary"
              >
                Load Test Conversation
              </button>
              
              <button 
                onClick={loadTestFileFromProject}
                disabled={importing}
                className="btn-outline"
              >
                {importing ? 'Loading...' : 'Load Test File'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No conversations yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Import your first conversation to get started with analysis and labeling
            </p>
            <button 
              onClick={handleImportConversation}
              disabled={importing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import Your First Conversation'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation: any) => (
            <div key={conversation.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/conversations/${conversation.id}`}
                      className="text-lg font-semibold text-foreground hover:text-primary-600 transition-colors duration-200"
                    >
                      {conversation.title}
                    </Link>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span>Model: {conversation.modelVersion || 'Unknown'}</span>
                      <span>Messages: {conversation.messageCount}</span>
                      <span>Length: {conversation.conversationLength}</span>
                      <span>Created: {new Date(conversation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link 
                      to={`/conversations/${conversation.id}`}
                      className="btn-outline text-sm"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/survey?conversationId=${conversation.id}`}
                      className="btn-secondary text-sm"
                    >
                      Survey
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
