import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Conversation {
  id: string;
  title: string;
  modelVersion?: string;
  conversationLength: number;
  createdAt: string;
  messageCount: number;
}

const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          messageCount: 15
        },
        {
          id: '2',
          title: 'Sample Conversation 2',
          modelVersion: 'GPT-3.5',
          conversationLength: 8,
          createdAt: new Date().toISOString(),
          messageCount: 8
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

  const handleImportConversation = async () => {
    try {
      // This will be replaced with actual file import logic
      console.log('Import conversation clicked');
    } catch (err) {
      setError('Failed to import conversation');
      console.error('Error importing conversation:', err);
    }
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
        
        <button 
          onClick={handleImportConversation}
          className="btn-primary"
        >
          Import Conversation
        </button>
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
              className="btn-primary"
            >
              Import Your First Conversation
            </button>
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
