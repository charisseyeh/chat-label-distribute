import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useConversationStore,
  useSelectedConversations,
  useLoadedConversations,
  useCurrentSourceFile,
  useConversationLoading,
  useConversationError
} from '../stores/conversationStore';
import { useNavigationStore } from '../stores/navigationStore';
import { useSurveyStore } from '../stores/surveyStore';
import { TwoPanelLayout } from '../components/common';
import SurveySidebar from '../components/survey/SurveySidebar';
import ConversationDetail from '../components/conversation/core/ConversationDetail';

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Use optimized selectors to prevent unnecessary re-renders
  const storeSelectedConversations = useSelectedConversations();
  const loadedConversations = useLoadedConversations();
  const currentSourceFile = useCurrentSourceFile();
  const conversationsLoading = useConversationLoading();
  const conversationsError = useConversationError();
  
  // Only get the functions we need from the store
  const { 
    conversations, 
    getConversationById,
    loadSelectedConversationsFromStorage,
    setCurrentSourceFile,
    ensureConversationsLoaded,
    loadFullConversationData
  } = useConversationStore();
  
  const { selectedConversations, setSelectedConversations, setCurrentConversationId } = useNavigationStore();
  const { responses: surveyResponses } = useSurveyStore();

  // Add state to track scroll tracking events
  const [scrollTrackingState, setScrollTrackingState] = useState({
    turn6Reached: false,
    endReached: false
  });

  // Add callback handlers for scroll tracking events
  const handleTurn6Reached = useCallback(() => {
    setScrollTrackingState(prev => ({ ...prev, turn6Reached: true }));
  }, []);

  const handleEndReached = useCallback(() => {
    setScrollTrackingState(prev => ({ ...prev, endReached: true }));
  }, []);

  // Load selected conversations from permanent storage on mount - only run once
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        await loadSelectedConversationsFromStorage();
      } catch (error) {
        // Silent error handling
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
      setSelectedConversations([]);
    }
  }, [storeSelectedConversations, setSelectedConversations]);

  // Handle conversation changes and data loading
  useEffect(() => {
    if (!id) return;

    // Reset scroll tracking state when conversation changes
    setScrollTrackingState({
      turn6Reached: false,
      endReached: false
    });

    // Set current conversation ID in navigation store
    setCurrentConversationId(id);

    // Load conversation data if we have selected conversations
    if (storeSelectedConversations.length > 0) {
      const currentConv = storeSelectedConversations.find(conv => conv.id === id);
      if (currentConv?.sourceFilePath && currentConv.sourceFilePath !== currentSourceFile) {
        setCurrentSourceFile(currentConv.sourceFilePath);
        
        // Load conversations and full conversation data
        ensureConversationsLoaded(currentConv.sourceFilePath)
          .then(() => {
            return loadFullConversationData(id, currentConv.sourceFilePath);
          })
          .catch(error => {
            // Silent error handling
          });
      }
    }

    // Cleanup function
    return () => {
      setCurrentConversationId(null);
    };
  }, [id, storeSelectedConversations, currentSourceFile, setCurrentSourceFile, setCurrentConversationId, ensureConversationsLoaded, loadFullConversationData]);

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
          messages={[]}
          turn6Reached={scrollTrackingState.turn6Reached}  // Pass boolean instead of callback
          endReached={scrollTrackingState.endReached}      // Pass boolean instead of callback
        />
      }
      className="conversation-page"
    >
      <ConversationDetail 
        onTurn6Reached={handleTurn6Reached}
        onEndReached={handleEndReached}
      />
    </TwoPanelLayout>
  );
};

export default ConversationPage;
