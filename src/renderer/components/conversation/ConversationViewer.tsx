import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { useSurveyStore } from '../../stores/surveyStore';

import SurveySidebar from '../survey/SurveySidebar';

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
  
  const { selectedConversations, setSelectedConversations, setCurrentConversationId } = useNavigationStore();
  const { responses: surveyResponses } = useSurveyStore();
  
  const [currentConversation, setCurrentConversation] = useState<any>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [messageLimit, setMessageLimit] = useState(50); // Start with first 50 messages
  const [showAllMessages, setShowAllMessages] = useState(false);

  // Set current conversation ID in navigation store
  useEffect(() => {
    if (id) {
      setCurrentConversationId(id);
    }
    
    return () => {
      // Clear current conversation ID when component unmounts
      setCurrentConversationId(null);
    };
  }, [id, setCurrentConversationId]);

  // Memoize the loadMessages function to prevent it from changing on every render
  const loadMessages = useCallback(async (conversation: any) => {
    if (!conversation || !id) return;
    
    // Get the source file path from the conversation or fall back to currentSourceFile
    const sourceFilePath = conversation.filePath || currentSourceFile;
    
    if (!sourceFilePath) {
      setError('No source file path available for this conversation');
      return;
    }
    
    try {
      // Check cache first
      const cacheKey = `conversation_${id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.timestamp && (Date.now() - cachedData.timestamp) < 24 * 60 * 60 * 1000) {
            setMessages(cachedData.messages);
            setDisplayedMessages(cachedData.messages.slice(0, messageLimit));
            return;
          }
        } catch (error) {
          console.warn('Invalid cache data, reloading...');
        }
      }
      
      // Load from file using Electron API
      if (!window.electronAPI || !window.electronAPI.readSingleConversation) {
        throw new Error('Electron API not available');
      }
      
      const result = await window.electronAPI.readSingleConversation(sourceFilePath, id);
      
      if (!result.success || !result.found) {
        throw new Error('Conversation not found in file');
      }
      
      const conversationData = result.data;
      
      // Extract messages
      let messages: Message[] = [];
      if (conversationData.mapping) {
        messages = extractMessagesFromMapping(conversationData.mapping);
      } else if (conversationData.messages) {
        messages = conversationData.messages;
      }
      
      setMessages(messages);
      setDisplayedMessages(messages.slice(0, messageLimit));
      
      // Cache the messages
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          messages,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to cache messages:', error);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  }, [id, currentSourceFile, messageLimit]);

  // Memoize the cleanup function
  const cleanupOldCache = useCallback(() => {
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
  }, []);

  // Load selected conversations from permanent storage on mount - only run once
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const result = await loadSelectedConversationsFromStorage();
      } catch (error) {
        console.warn('Failed to load selected conversations from storage:', error);
      }
    };
    loadFromStorage();
    
    // Clean up old cache entries
    cleanupOldCache();
  }, []); // Empty dependency array - only run once on mount

  // Synchronize navigation store with conversation store when storeSelectedConversations change
  useEffect(() => {
    if (storeSelectedConversations.length > 0) {
      setSelectedConversations(storeSelectedConversations.map(conv => ({
        id: conv.id,
        title: conv.title
      })));
    } else {
      // Clear the navigation store if there are no selected conversations
      setSelectedConversations([]);
    }
  }, [storeSelectedConversations, setSelectedConversations]);

  // Load conversation and messages - only run when id changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get conversation from store
        const conversation = getConversationById(id);
        
        if (!conversation) {
          setError('Conversation not found');
          return;
        }
        
        setCurrentConversation(conversation);
        
        // Load messages
        await loadMessages(conversation);
        
      } catch (error) {
        console.error('Error loading conversation:', error);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    loadConversation();
  }, [id]); // Only depend on id, not on functions that change every render

  // Update displayed messages when messageLimit changes
  useEffect(() => {
    if (messages.length > 0) {
      setDisplayedMessages(messages.slice(0, messageLimit));
    }
  }, [messageLimit, messages]);

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
          const content = msg.message.content.parts[0];
          if (content && typeof content === 'string' && content.trim() !== '') {
            messages.push({
              id: id,
              role: msg.message.author.role,
              content: content,
              create_time: msg.message.create_time || Date.now() / 1000
            });
          }
        }
      });
      
      return messages;
    } catch (error) {
      console.error('Error extracting messages from mapping:', error);
      return [];
    }
  };

  // Get survey completion status
  const getSurveyCompletionStatus = () => {
    if (!id) return { completed: 0, total: 3 };
    
    const conversationResponses = surveyResponses.filter((r: any) => r.conversationId === id);
    const completedPositions = new Set(conversationResponses.map((r: any) => r.position));
    
    return {
      completed: completedPositions.size,
      total: 3
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
      await loadMessages(currentConversation);
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
    <div className="flex h-screen bg-background conversation-viewer">
      {/* Main Content - 80% width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-white">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{currentConversation.title}</h1>
            </div>
          </div>
        </div>

        {/* Conversation Metadata */}
        <div className="p-6 bg-white border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Messages</div>
              <div className="font-medium">{currentConversation.messageCount}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(currentConversation.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Messages Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 messages-container">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {!Array.isArray(messages) ? 'Error: Messages not loaded properly' : 'No messages found in this conversation'}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedMessages.map((message, index) => (
                  <div key={message.id} className="flex space-x-3">
                    
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

      {/* Survey Sidebar - 20% width */}
      <SurveySidebar 
        conversationId={id || ''}
        messages={messages}
      />
    </div>
  );
};

export default ConversationViewer;
