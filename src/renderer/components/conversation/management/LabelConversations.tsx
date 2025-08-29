import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationStore } from '../../../stores/conversationStore';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useSurveyResponseStore } from '../../../stores/surveyResponseStore';
import { useSurveyQuestions } from '../../../hooks/survey/useSurveyQuestions';
import { List } from '../../common/molecules/list/List';

const LabelConversations: React.FC = () => {
  const { 
    selectedConversationIds, 
    selectedConversations: storeSelectedConversations,
    loadedConversations,
    loadSelectedConversationsFromStorage,
    clearAllSelectedAndSave
  } = useConversationStore();
  const { selectedConversations, setSelectedConversations } = useNavigationStore();
  const { getProgress } = useSurveyResponseStore();
  const { currentTemplate } = useSurveyQuestions();
  const navigate = useNavigate();

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

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleBackToSelection = () => {
    navigate('/select-conversations');
  };

  // Transform conversations to list items format with real data
  const listItems = selectedConversations.map((conversation) => {
    // Find the full conversation data from loaded conversations
    const fullConversation = loadedConversations.find(conv => conv.id === conversation.id);
    
    // Format the date
    const dateCreated = fullConversation?.createdAt 
      ? new Date(fullConversation.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Unknown date';
    
    return {
      title: conversation.title || 'Untitled Conversation',
      metadata: [dateCreated],
      onClick: () => handleConversationClick(conversation.id)
    };
  });

  if (selectedConversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Label Conversations</h2>
          <p className="text-gray-600 mb-4">
            No conversations selected for labeling. Please go back to the conversation selection page.
          </p>
          <button
            onClick={handleBackToSelection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Conversations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 border border-border overflow-hidden"
    style={{ borderRadius: 'var(--radius-lg)' }}>
      <List
        variant="with-dividers"
        items={listItems}
        listItemVariant="double"
        spacious
      />
    </div>
  );
};

export default LabelConversations;
