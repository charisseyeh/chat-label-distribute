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
    loading: conversationsLoading,
    error: conversationsError,
    loadSelectedConversationsFromStorage
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
