import { useState, useMemo } from 'react';
import { useSurveyResponseStore } from '../../stores/surveyResponseStore';
import { useConversationStore } from '../../stores/conversationStore';

export const useConversationSelection = () => {
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  
  const { conversationData } = useSurveyResponseStore();
  const { selectedConversations: storeConversations } = useConversationStore();

  // Get conversations with survey data
  const conversationsWithData = useMemo(() => {
    return Object.keys(conversationData).map(conversationId => {
      const data = conversationData[conversationId];
      const conversation = storeConversations.find(c => c.id === conversationId);
      return {
        id: conversationId,
        title: conversation?.title || 'Unknown Conversation',
        data,
        hasResponses: data.responses.length > 0
      };
    }).filter(conv => conv.hasResponses);
  }, [conversationData, storeConversations]);

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversationIds(prev => 
      prev.includes(conversationId) 
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const clearSelection = () => {
    setSelectedConversationIds([]);
  };

  return {
    selectedConversationIds,
    conversationsWithData,
    toggleConversationSelection,
    clearSelection
  };
};
