import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../stores/conversationStore';
import { useNavigationStore } from '../stores/navigationStore';
import { useSurveyStore } from '../stores/surveyStore';
import { TwoPanelLayout } from '../components/common';
import SurveySidebar from '../components/survey/SurveySidebar';
import ConversationDetail from '../components/conversation/core/ConversationDetail';

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    conversations, 
    getConversationById,
    selectedConversations: storeSelectedConversations,
    loadedConversations,
    currentSourceFile,
    loading: conversationsLoading,
    error: conversationsError,
    loadSelectedConversationsFromStorage,
    setCurrentSourceFile,
    ensureConversationsLoaded,
    loadFullConversationData
  } = useConversationStore();
  
  const { selectedConversations, setSelectedConversations, setCurrentConversationId } = useNavigationStore();
  const { responses: surveyResponses } = useSurveyStore();

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

  // Load selected conversations from permanent storage on mount - only run once
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const result = await loadSelectedConversationsFromStorage();
        if (result) {
          console.log('✅ Successfully loaded selected conversations from storage');
        }
      } catch (error) {
        console.warn('Failed to load selected conversations from storage:', error);
      }
    };
    loadFromStorage();
  }, [loadSelectedConversationsFromStorage]);

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

  // Ensure current source file is set for the conversation
  useEffect(() => {
    if (id && storeSelectedConversations.length > 0) {
      const currentConv = storeSelectedConversations.find(conv => conv.id === id);
      if (currentConv?.sourceFilePath && currentConv.sourceFilePath !== currentSourceFile) {
        console.log('🔄 Setting current source file:', currentConv.sourceFilePath);
        setCurrentSourceFile(currentConv.sourceFilePath);
        
        // Ensure conversations are loaded for this source file
        ensureConversationsLoaded(currentConv.sourceFilePath).then(() => {
          console.log('✅ Conversations loaded for source file:', currentConv.sourceFilePath);
          
          // Also load the full conversation data for the current conversation
          if (id) {
            loadFullConversationData(id, currentConv.sourceFilePath).then((data) => {
              if (data) {
                console.log('✅ Full conversation data loaded for:', id);
              } else {
                console.warn('⚠️ Failed to load full conversation data for:', id);
              }
            });
          }
        }).catch(error => {
          console.error('❌ Failed to load conversations:', error);
        });
      }
    }
  }, [id, storeSelectedConversations, currentSourceFile, setCurrentSourceFile, ensureConversationsLoaded, loadFullConversationData]);

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

  const handleBackToLabeling = () => {
    navigate('/label-conversations');
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversation...</div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">{conversationsError}</div>
        <button 
          onClick={() => { window.location.reload(); }}
          className="btn-primary ml-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check if we have the necessary data
  if (!id || storeSelectedConversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-error mb-4">No conversation data available</div>
          <div className="text-sm text-muted-foreground mb-4">
            ID: {id}<br/>
            Selected conversations: {storeSelectedConversations.length}<br/>
            Loaded conversations: {loadedConversations.length}<br/>
            Current source file: {currentSourceFile || 'None'}
          </div>
          <button 
            onClick={handleBackToLabeling}
            className="btn-primary"
          >
            Back to Labeling
          </button>
        </div>
      </div>
    );
  }

  const surveyStatus = getSurveyCompletionStatus();

  return (
    <TwoPanelLayout
      sidebarContent={
        <SurveySidebar 
          conversationId={id || ''}
          messages={[]} // Messages are now handled by ConversationDetail component
        />
      }
      className="conversation-page"
    >
      <ConversationDetail />
    </TwoPanelLayout>
  );
};

export default ConversationPage;
