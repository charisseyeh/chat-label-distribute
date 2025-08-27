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
      console.log('🚀 Footer "Go to Labeling" button clicked!');
      console.log('🚀 Current temporary selection count:', selectedConversationIds.length);
      console.log('🚀 Current permanently stored count:', selectedConversations.length);
      console.log('🚀 Temporary selection IDs:', selectedConversationIds);
      
      // First commit the temporary selection to selectedConversations
      console.log('🚀 Calling commitTemporarySelection...');
      useConversationStore.getState().commitTemporarySelection();
      
      // Then save selected conversations to permanent storage
      console.log('🚀 Calling saveSelectedConversationsToStorage...');
      const saveResult = await useConversationStore.getState().saveSelectedConversationsToStorage();
      console.log('🚀 Save result:', saveResult);
      
      if (!saveResult) {
        console.error('❌ Failed to save conversations to storage');
        return; // Don't navigate if save failed
      }
      
      // Add a small delay so user can see the sidebar update
      console.log('🚀 Waiting 1 second for sidebar to update...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to labeling page
      console.log('🚀 Navigation to labeling page...');
      navigate('/label-conversations');
    } catch (error) {
      console.error('❌ Failed to save selected conversations:', error);
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
