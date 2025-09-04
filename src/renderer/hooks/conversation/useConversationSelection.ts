import { useState, useMemo } from 'react';
import { useAssessmentResponseStore } from '../../stores/assessmentResponseStore';
import { useConversationStore } from '../../stores/conversationStore';

export const useConversationSelection = () => {
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  
  const { conversationData } = useAssessmentResponseStore();
  const { selectedConversations: storeConversations, getFullConversationData } = useConversationStore();

  // Get conversations with Assessment data - include all selected conversations, not just those with responses
  const conversationsWithData = useMemo(() => {
    return storeConversations.map(conversation => {
      const data = conversationData[conversation.id] || {
        conversationId: conversation.id,
        responses: [],
        completedSections: [],
        lastUpdated: new Date().toISOString()
      };
      
      // Get full conversation data to include createTime, aiRelevancy, etc.
      const fullConversationData = getFullConversationData(conversation.id);
      
      return {
        id: conversation.id,
        title: conversation.title || 'Unknown Conversation',
        data,
        hasResponses: data.responses.length > 0,
        messageCount: fullConversationData?.messageCount || 0,
        createTime: fullConversationData?.createTime,
        createdAt: fullConversationData?.createdAt,
        aiRelevancy: fullConversationData?.aiRelevancy
      };
    });
  }, [conversationData, storeConversations, getFullConversationData]);

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
