import React from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { selectedConversationIds, selectedConversations, currentSourceFile, filteredConversations } = useConversationStore();
  const { currentPage, setSelectedConversations, setCurrentPage } = useNavigationStore();
  const navigate = useNavigate();

  // Only show footer when there are selected conversations and we're on the select-conversations page
  if (selectedConversationIds.length === 0 || currentPage !== 'select-conversations') {
    return null;
  }

  const handleGoToLabeling = async () => {
    try {
      // First commit the temporary selection to selectedConversations
      useConversationStore.getState().commitTemporarySelection();
      
      // Then save selected conversations to permanent storage
      const saveResult = await useConversationStore.getState().saveSelectedConversationsToStorage();
      
      if (!saveResult) {
        console.error('❌ Failed to save conversations to storage');
        return; // Don't navigate if save failed
      }
      
      // Add a small delay so user can see the sidebar update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to labeling page
      navigate('/label-conversations');
    } catch (error) {
      console.error('❌ Failed to save selected conversations:', error);
    }
  };

  return (
    <footer className={`bg-background border-t border-border px-6 py-4 ${className}`}>
      <div className="flex items-center justify-end space-x-2">
        {/* Selection Information */}
        <div className="text-sm text-foreground">
          <span>{selectedConversationIds.length}/{filteredConversations.length} selected</span>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleGoToLabeling}
          className="btn-primary btn-md"
        >
          Add {selectedConversationIds.length} conversations to labeling
        </button>
      </div>
    </footer>
  );
};

export default Footer;
