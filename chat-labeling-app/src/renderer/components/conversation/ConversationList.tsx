import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useConversationImport } from '@/hooks/useConversationImport';
import { Conversation } from '@/stores/conversationStore';

const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the new import hook
  const { 
    importing, 
    importError, 
    importConversationFromFile, 
    createTestConversation, 
    loadTestFileFromProject,
    clearError 
  } = useConversationImport((conversation: Conversation) => {
    // Add the new conversation to the list
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = conversation;
        return updated;
      } else {
        // Add new
        return [...prev, conversation];
      }
    });
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // This will be replaced with actual API call
      const mockConversations: Conversation[] = [
        {
          id: '1',
          title: 'Sample Conversation 1',
          modelVersion: 'GPT-4',
          conversationLength: 15,
          createdAt: new Date().toISOString(),
          messageCount: 15,
          filePath: 'conversations/sample1.json'
        },
        {
          id: '2',
          title: 'Sample Conversation 2',
          modelVersion: 'GPT-3.5',
          conversationLength: 8,
          createdAt: new Date().toISOString(),
          messageCount: 8,
          filePath: 'conversations/sample2.json'
        }
      ];
      
      setConversations(mockConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importConversationFromFile(file);
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing conversation:', error);
      // Error is already handled in the hook
    }
  }, [importConversationFromFile]);

  const handleTestConversation = () => {
    createTestConversation();
  };

  const handleLoadTestFile = () => {
    loadTestFileFromProject();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">{error}</div>
      </div>
    );
  }

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
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            disabled={importing}
            className="hidden"
            id="file-input"
          />
          <label 
            htmlFor="file-input"
            className="btn-primary cursor-pointer"
          >
            {importing ? 'Importing...' : 'Import Conversation'}
          </label>
          
          <button 
            onClick={handleTestConversation}
            className="btn-secondary"
            disabled={importing}
          >
            Create Test
          </button>
          
          <button 
            onClick={handleLoadTestFile}
            className="btn-outline"
            disabled={importing}
          >
            Load Test File
          </button>
        </div>
      </div>

      {/* Import Error Display */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Import Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{importError}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={clearError}
                  className="bg-red-50 px-2 py-1 text-xs font-medium text-red-800 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-center space-x-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={importing}
                className="hidden"
                id="empty-file-input"
              />
              <label 
                htmlFor="empty-file-input"
                className="btn-primary cursor-pointer"
              >
                {importing ? 'Importing...' : 'Import Your First Conversation'}
              </label>
              <button 
                onClick={handleTestConversation}
                className="btn-secondary"
                disabled={importing}
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
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
                    <button className="btn-secondary text-sm">
                      Survey
                    </button>
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
