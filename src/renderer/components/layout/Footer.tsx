import React from 'react';
import { useConversationStore } from '../../stores/conversationStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { selectedConversationIds, selectedConversations, currentSourceFile } = useConversationStore();
  const { currentPage, setSelectedConversations, setCurrentPage } = useNavigationStore();
  const navigate = useNavigate();

  // Only show footer when there are selected conversations and we're on the select-conversations page
  if (selectedConversationIds.length === 0 || currentPage !== 'select-conversations') {
    return null;
  }

  const handleGoToLabeling = async () => {
    try {
      // Get the selected conversations with their file paths
      const selectedConvs = selectedConversations.map(conv => ({
        id: conv.id,
        title: conv.title || 'Untitled Conversation',
        sourceFilePath: currentSourceFile || ''
      }));
      
      // Store in conversation store for persistence
      useConversationStore.getState().setSelectedConversationsWithFile(selectedConvs);
      useConversationStore.getState().setCurrentSourceFile(currentSourceFile || '');
      
      // Save to permanent storage
      await useConversationStore.getState().saveSelectedConversationsToStorage();
      
      // Also update navigation store for backward compatibility
      setSelectedConversations(selectedConvs.map(conv => ({
        id: conv.id,
        title: conv.title
      })));
      setCurrentPage('label-conversations');
      
      // Navigate to labeling page
      navigate('/label-conversations');
    } catch (error) {
      console.error('Failed to navigate to labeling:', error);
    }
  };

  return (
    <footer className={`bg-background border-t border-border px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Selection Information */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-foreground">
              <strong>{selectedConversationIds.length} conversation(s) selected for labeling</strong>
            </div>
            <div className="text-xs text-muted-foreground">
              Selected IDs: {selectedConversationIds.join(', ')}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoToLabeling}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>Go to</span>
            <span>Labeling</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
