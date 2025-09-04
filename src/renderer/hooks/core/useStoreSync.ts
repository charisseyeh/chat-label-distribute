import { useEffect, useMemo } from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';

export const useStoreSync = () => {
  const { selectedConversations } = useConversationStore();
  const { setSelectedConversations } = useNavigationStore();

  // Memoize the transformed conversations to prevent unnecessary updates
  const transformedConversations = useMemo(() => {
    return selectedConversations.map(conv => ({
      id: conv.id,
      title: conv.title
    }));
  }, [selectedConversations]);

  // Only update navigation store when the transformed data actually changes
  useEffect(() => {
    setSelectedConversations(transformedConversations);
  }, [transformedConversations, setSelectedConversations]);
};
