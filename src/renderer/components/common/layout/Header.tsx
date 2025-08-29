import React, { useMemo, useCallback } from 'react';
import { List, X, CaretRight } from '@phosphor-icons/react';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useConversationStore } from '../../../stores/conversationStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = React.memo(({ isSidebarOpen }) => {
  const { currentPage, currentConversationId } = useNavigationStore();
  const { selectedConversations } = useConversationStore();
  const navigate = useNavigate();

  const getPageTitle = useCallback((page: string) => {
    switch (page) {
      case 'select-conversations':
        return 'Select Conversations';
      case 'label-conversations':
        return 'Label Conversations';
      case 'ai-comparisons':
        return 'AI Comparisons';
      case 'survey-questions':
        return 'Survey Questions';
      default:
        return 'Unknown Page';
    }
  }, []);

  const getPageDescription = useCallback((page: string) => {
    switch (page) {
      case 'select-conversations':
        return 'Select conversations to analyze and label';
      case 'label-conversations':
        return 'Label and categorize selected conversations';
      case 'ai-comparisons':
        return 'Compare AI model performance across conversations';
      case 'survey-questions':
        return 'Create and manage survey templates and questions';
      default:
        return 'Navigation and analysis tools';
    }
  }, []);

  const getCurrentConversationTitle = useCallback(() => {
    if (!currentConversationId) return null;
    const conversation = selectedConversations.find(conv => conv.id === currentConversationId);
    return conversation?.title || 'Unknown Conversation';
  }, [currentConversationId, selectedConversations]);

  // Memoize expensive calculations
  const pageTitle = useMemo(() => getPageTitle(currentPage), [getPageTitle, currentPage]);
  const pageDescription = useMemo(() => getPageDescription(currentPage), [getPageDescription, currentPage]);
  const conversationTitle = useMemo(() => getCurrentConversationTitle(), [getCurrentConversationTitle]);

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex space-y-2">
        <div className="flex flex-col items-left">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2">
            <h1 className="text-h3 text-foreground">
              {currentConversationId ? (
                <span className="text-h3 text-foreground">
                  Label Conversations
                </span>
              ) : (
                pageTitle
              )}
            </h1>
            
            {currentConversationId && (
              <>
                <CaretRight size={20} className="text-muted-foreground" />
                <span className="text-h3 text-foreground">
                  {conversationTitle}
                </span>
              </>
            )}
          </div>
          
          <span className="text-sm text-muted-foreground">
            {currentConversationId 
              ? ``
              : pageDescription
            }
          </span>
        </div>
        
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
