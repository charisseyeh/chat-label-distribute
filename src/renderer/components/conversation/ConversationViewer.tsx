import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';
import { useSurveyStore } from '../../stores/surveyStore';
import { readJsonFile } from '../../utils/conversationUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  create_time: number;
}

const ConversationViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    conversations, 
    getConversationById,
    loading: conversationsLoading,
    error: conversationsError 
  } = useConversations();
  
  const { responses: surveyResponses } = useSurveyStore();
  
  const [currentConversation, setCurrentConversation] = useState<ReturnType<typeof getConversationById>>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
    }
  }, [id, conversations]);

  const loadConversation = () => {
    try {
      if (!id) return;
      const found = getConversationById(id);
      if (found) {
        setCurrentConversation(found);
        setLoading(false);
      } else {
        setError('Conversation not found');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load conversation');
      setLoading(false);
    }
  };

  const loadMessages = () => {
    try {
      if (!id) return;
      
      const savedConversationData = localStorage.getItem(`conversation_${id}`);
      if (savedConversationData) {
        const data = JSON.parse(savedConversationData);
        const extractedMessages = readJsonFile(data);
        setMessages(extractedMessages);
      }
    } catch (err) {
      // Silently handle message loading errors
    }
  };

  const getSurveyCompletionStatus = () => {
    if (!id) return { completed: 0, total: 3, positions: [] };
    
    const positions = ['beginning', 'turn6', 'end'] as const;
    const conversationResponses = surveyResponses.filter((r: any) => r.conversationId === id);
    const completed = positions.filter(pos => 
      conversationResponses.some((r: any) => r.position === pos)
    );
    
    return {
      completed: completed.length,
      total: positions.length,
      positions: completed
    };
  };

  const formatMessageContent = (content: string) => {
    // Basic formatting - could be enhanced with markdown parsing
    return content.split('\n').map((line, index) => (
      <div key={index} className="mb-2">
        {line || <br />}
      </div>
    ));
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user': return 'You';
      case 'assistant': return 'Assistant';
      case 'system': return 'System';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assistant': return 'bg-green-100 text-green-800 border-green-200';
      case 'system': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBackToLabeling = () => {
    navigate('/label-conversations');
  };

  if (loading || conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  if (error || conversationsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">{error || conversationsError}</div>
        <button 
          onClick={() => { setError(null); }}
          className="btn-primary ml-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">Conversation not found</div>
      </div>
    );
  }

  const surveyStatus = getSurveyCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToLabeling}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Labeling
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentConversation.title}</h1>
            <p className="text-muted-foreground mt-2">
              Conversation details and analysis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Survey Link */}
          <Link 
            to={`/survey?conversationId=${id}`}
            className="btn-primary"
          >
            {surveyStatus.completed > 0 ? 'Continue Survey' : 'Start Survey'}
          </Link>
          {/* AI Analysis Link */}
          <Link 
            to="/ai-analysis"
            className="btn-secondary"
          >
            AI Analysis
          </Link>
        </div>
      </div>

      {/* Conversation Metadata */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Model</div>
              <div className="font-medium">{currentConversation.modelVersion || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Messages</div>
              <div className="font-medium">{currentConversation.messageCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Length</div>
              <div className="font-medium">{currentConversation.conversationLength}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(currentConversation.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Progress */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Survey Progress</h3>
            <div className="text-sm text-muted-foreground">
              {surveyStatus.completed}/{surveyStatus.total} positions completed
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {['beginning', 'turn6', 'end'].map((position) => {
              const isCompleted = surveyResponses.some((r: any) => r.position === position && r.conversationId === id);
              const positionLabel = {
                beginning: 'Beginning',
                turn6: 'Turn 6',
                end: 'End'
              }[position];
              
              return (
                <div
                  key={position}
                  className={`p-3 rounded-lg border-2 text-center ${
                    isCompleted
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="font-medium">{positionLabel}</div>
                  <div className="text-xs">
                    {isCompleted ? 'Completed' : 'Pending'}
                  </div>
                </div>
              );
            })}
          </div>
          
          {surveyStatus.completed > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Survey Progress:</strong> You've completed {surveyStatus.completed} out of {surveyStatus.total} positions. 
                {surveyStatus.completed < surveyStatus.total ? ' Continue to complete all positions.' : ' All positions completed!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="card">
        <div className="card-content">
          <h3 className="text-lg font-medium text-foreground mb-4">Conversation Messages</h3>
          
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages found in this conversation
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className="flex space-x-3">
                  {/* Message Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(message.role)}`}>
                        {getRoleDisplayName(message.role)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.create_time * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      {formatMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleBackToLabeling}
          className="btn-outline"
        >
          ← Back to Labeling
        </button>
        
        <Link 
          to={`/survey?conversationId=${id}`}
          className="btn-primary"
        >
          {surveyStatus.completed === 0 ? 'Start Survey' : 'Continue Survey'}
        </Link>
        
        <Link 
          to="/export"
          className="btn-outline"
        >
          Export Data
        </Link>
      </div>
    </div>
  );
};

export default ConversationViewer;
