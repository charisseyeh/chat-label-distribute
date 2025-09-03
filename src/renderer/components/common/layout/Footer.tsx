import React, { useCallback, useMemo } from 'react';
import { useConversationStore } from '../../../stores/conversationStore';
import { useNavigationStore } from '../../../stores/navigationStore';
import { usePageActionsStore } from '../../../stores/pageActionsStore';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  className?: string;
  onExportComparison?: () => void;
  hasComparisonData?: boolean;
}

const Footer: React.FC<FooterProps> = React.memo(({ className = '', onExportComparison, hasComparisonData }) => {
  const { selectedConversationIds, selectedConversations, currentSourceFile, filteredConversations } = useConversationStore();
  const { currentPage, setSelectedConversations, setCurrentPage } = useNavigationStore();
  const { saveHandler, pendingChangesCount, showSaveFeedback, setShowSaveFeedback } = usePageActionsStore();
  const navigate = useNavigate();



  // Memoize expensive calculations
  const selectionInfo = useMemo(() => ({
    selectedCount: selectedConversationIds.length,
    totalCount: filteredConversations.length,
    hasSelection: selectedConversationIds.length > 0
  }), [selectedConversationIds.length, filteredConversations.length]);

  const handleAddConversations = useCallback(async () => {
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
  }, [navigate]);

  const handleSaveChanges = useCallback(async () => {
    if (saveHandler) {
      try {
        await saveHandler();
        // Show feedback for 2 seconds
        setShowSaveFeedback(true);
        setTimeout(() => {
          setShowSaveFeedback(false);
        }, 2000);
      } catch (error) {
        console.error('❌ Save failed:', error);
      }
    }
  }, [saveHandler, setShowSaveFeedback]);

  // Only show footer when there are selected conversations and we're on the select-conversations page
  if (currentPage === 'select-conversations') {
    if (!selectionInfo.hasSelection) {
      return null;
    }

    return (
      <footer className={`bg-background border-t border-border px-6 py-4 ${className}`}>
        <div className="flex items-center justify-end space-x-2">
          {/* Selection Information */}
          <div className="text-sm text-foreground">
            <span>{selectionInfo.selectedCount}/{selectionInfo.totalCount} selected</span>
          </div>
          
          {/* Action Button */}
          <button
            onClick={handleAddConversations}
            className="btn-primary btn-md"
          >
            Add {selectionInfo.selectedCount} conversations to labeling
          </button>
        </div>
      </footer>
    );
  }

  // For survey questions page, show save changes footer
  if (currentPage === 'survey-questions' || currentPage === 'survey-templates') {
    if (!saveHandler) {
      return null; // Don't show footer if no save handler is set
    }

    return (
      <footer className={`bg-background border-t border-border px-6 py-4 ${className}`}>
        <div className="flex items-center justify-end space-x-2">
          <div className="text-sm text-foreground">
            {pendingChangesCount > 0 ? (
              <span>{pendingChangesCount} unsaved changes</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          
          {/* Action Button */}
          <button
            onClick={handleSaveChanges}
            disabled={pendingChangesCount === 0}
            className="btn-primary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showSaveFeedback ? 'Changes saved!' : 'Save Changes'}
          </button>
        </div>
      </footer>
    );
  }

  // For AI comparisons page, show export button
  if (currentPage === 'ai-comparisons') {
    if (!hasComparisonData || !onExportComparison) {
      return null; // Don't show footer if no comparison data or export handler
    }

    return (
      <footer className={`bg-background border-t border-border px-6 py-4 ${className}`}>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={onExportComparison}
            className="btn-primary btn-md"
          >
            Export comparison results
          </button>
        </div>
      </footer>
    );
  }

  // For other pages, don't show footer
  return null;
});

Footer.displayName = 'Footer';

export default Footer;
