import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
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
    selectedConversations: storeSelectedConversations,
    currentSourceFile,
    loading: conversationsLoading,
    error: conversationsError,
    loadSelectedConversationsFromStorage
  } = useConversationStore();
  
  const { selectedConversations } = useNavigationStore();
  const { responses: surveyResponses } = useSurveyStore();
  
  const [currentConversation, setCurrentConversation] = useState<any>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [messageLimit, setMessageLimit] = useState(50); // Start with first 50 messages
  const [showAllMessages, setShowAllMessages] = useState(false);

  // Load selected conversations from permanent storage on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        await loadSelectedConversationsFromStorage();
      } catch (error) {
        console.warn('Failed to load selected conversations from storage:', error);
      }
    };
    loadFromStorage();
    
    // Clean up old cache entries
    cleanupOldCache();
  }, [loadSelectedConversationsFromStorage]);

  // Clean up old localStorage cache entries
  const cleanupOldCache = () => {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('conversation_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove invalid cache entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  };

  // Helper function to extract messages from conversation mapping
  const extractMessagesFromMapping = (mapping: Record<string, any>): Message[] => {
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
      
      messageEntries.forEach(([id, msg], index) => {
        if (msg.message) {
          // Fix: Get content from parts array directly, not from .text property
          const content = msg.message.content?.parts?.[0] || '';
          const role = msg.message.author?.role || 'user';
          const createTime = msg.message.create_time || Date.now() / 1000;
          
          messages.push({
            id,
            role: role as 'user' | 'assistant' | 'system',
            content,
            create_time: createTime
          });
        }
      });
      
      return messages;
    } catch (error) {
      console.error('Error extracting messages from mapping:', error);
      return [];
    }
  };

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        await loadConversation();
        await loadMessages();
      };
      loadData();
    }
  }, [id, conversations, selectedConversations, storeSelectedConversations, currentSourceFile]);

  // Handle lazy loading of messages
  useEffect(() => {
    if (messages.length > 0) {
      const limit = showAllMessages ? messages.length : Math.min(messageLimit, messages.length);
      setDisplayedMessages(messages.slice(0, limit));
    }
  }, [messages, messageLimit, showAllMessages]);

  const loadConversation = async () => {
    try {
      if (!id) return;
      
      // First try to get from conversation store
      let found = getConversationById(id);
      
      // If not found there, check store selected conversations
      if (!found && storeSelectedConversations.length > 0) {
        const storeConversation = storeSelectedConversations.find(conv => conv.id === id);
        if (storeConversation && storeConversation.sourceFilePath) {
          // Load the conversation data from the source file using the new method
          try {
            // Use the new single conversation reader
            if (window.electronAPI && window.electronAPI.readSingleConversation) {
              const result = await window.electronAPI.readSingleConversation(storeConversation.sourceFilePath, id);
              
              if (result.success && result.found && result.data) {
                const rawConversation = result.data;
                
                // Convert raw conversation to expected format
                found = {
                  id: rawConversation.conversation_id || rawConversation.id || id,
                  title: rawConversation.title || 'Untitled Conversation',
                  modelVersion: rawConversation.model || 'Unknown',
                  conversationLength: rawConversation.mapping ? Object.keys(rawConversation.mapping).length * 100 : 0,
                  createdAt: new Date((rawConversation.create_time || Date.now()) * 1000).toISOString(),
                  messageCount: (() => {
                    if (!rawConversation.mapping) return 0;
                    const totalMessages = Object.keys(rawConversation.mapping).filter(key => 
                      rawConversation.mapping[key].message
                    ).length;
                    const filteredMessages = Object.keys(rawConversation.mapping).filter(key => {
                      const message = rawConversation.mapping[key].message;
                      if (!message || !message.content || !message.content.parts || !Array.isArray(message.content.parts)) {
                        return false;
                      }
                      const firstPart = message.content.parts[0];
                      return firstPart && typeof firstPart === 'string' && firstPart.trim() !== '';
                    }).length;
                    return filteredMessages;
                  })(),
                  filePath: storeConversation.sourceFilePath
                };
              } else {
                // Conversation not found in source file
              }
            } else {
              // Single conversation read not available
            }
          } catch (fileError) {
            console.warn('⚠️ Failed to load from source file:', fileError);
          }
        }
      }
      
      // If still not found, check navigation store (fallback)
      if (!found) {
        const navConversation = selectedConversations.find(conv => conv.id === id);
        if (navConversation) {
          // Convert navigation store format to expected format
          found = {
            ...navConversation,
            conversationLength: 0, // Default values for missing properties
            createdAt: new Date().toISOString(),
            messageCount: 0,
            filePath: '',
            modelVersion: 'Unknown'
          };
        }
      }
      
      if (found) {
        setCurrentConversation(found);
        setLoading(false);
      } else {
        setError('Conversation not found');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error loading conversation:', err);
      setError('Failed to load conversation');
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      if (!id) return;
      
      // Try to load messages from the source file first (most reliable)
      const storeConversation = storeSelectedConversations.find(conv => conv.id === id);
      if (storeConversation && storeConversation.sourceFilePath) {
        try {
          if (window.electronAPI && window.electronAPI.readSingleConversation) {
            const result = await window.electronAPI.readSingleConversation(storeConversation.sourceFilePath, id);
            
            if (result.success && result.found && result.data && result.data.mapping) {
              const messages = extractMessagesFromMapping(result.data.mapping);
              setMessages(messages);
              
              // Cache messages in localStorage for faster subsequent loads
              try {
                localStorage.setItem(`conversation_${id}`, JSON.stringify({
                  messages,
                  timestamp: Date.now(),
                  sourceFile: storeConversation.sourceFilePath
                }));
              } catch (cacheError) {
                console.warn('Failed to cache messages:', cacheError);
              }
              return;
            }
          }
        } catch (fileError) {
          console.warn('⚠️ Failed to load messages from source file:', fileError);
        }
      }
      
      // Fallback: try to load from localStorage cache
      try {
        const savedData = localStorage.getItem(`conversation_${id}`);
        if (savedData) {
          const data = JSON.parse(savedData);
          // Check if cache is still valid (same source file)
          if (data.sourceFile === currentSourceFile && data.messages) {
            setMessages(data.messages);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Failed to load from cache:', cacheError);
      }
      
      // Last resort: try to extract from current conversation
      if (currentConversation && currentConversation.mapping) {
        const extractedMessages = readJsonFile(currentConversation);
        setMessages(extractedMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('❌ Error in loadMessages:', err);
      setMessages([]);
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

  const handleRefreshMessages = async () => {
    // Clear cache and reload messages
    try {
      localStorage.removeItem(`conversation_${id}`);
      await loadMessages();
    } catch (error) {
      console.error('Failed to refresh messages:', error);
    }
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
          
          {/* Performance Metrics */}
          {/* Removed performance metrics as per edit hint */}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-foreground">Conversation Messages</h3>
            {messages.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {displayedMessages.length} of {messages.length} messages
                </div>
                <button
                  onClick={handleRefreshMessages}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  title="Refresh messages from source"
                >
                  ↻ Refresh
                </button>
              </div>
            )}
          </div>
          
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {!Array.isArray(messages) ? 'Error: Messages not loaded properly' : 'No messages found in this conversation'}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedMessages.map((message, index) => (
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
              
              {/* Lazy Loading Controls */}
              {messages.length > messageLimit && !showAllMessages && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setMessageLimit(prev => Math.min(prev + 50, messages.length))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Load More Messages (+50)
                    </button>
                    <button
                      onClick={() => setShowAllMessages(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Show All Messages ({messages.length})
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading messages in batches for better performance
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Optimization Recommendations */}
      {/* Removed performance metrics as per edit hint */}

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
