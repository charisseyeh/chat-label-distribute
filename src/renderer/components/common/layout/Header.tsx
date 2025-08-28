import React from 'react';
import { List, X, CaretRight } from '@phosphor-icons/react';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useConversationStore } from '../../../stores/conversationStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const { currentPage, currentConversationId } = useNavigationStore();
  const { selectedConversations } = useConversationStore();
  const navigate = useNavigate();

  const getPageTitle = (page: string) => {
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
  };

  const getPageDescription = (page: string) => {
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
  };

  const getCurrentConversationTitle = () => {
    if (!currentConversationId) return null;
    const conversation = selectedConversations.find(conv => conv.id === currentConversationId);
    return conversation?.title || 'Unknown Conversation';
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="btn-icon btn-primary"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <X size={20} /> : <List size={20} />}
          </button>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">
              {currentConversationId ? (
                <button
                  onClick={() => navigate('/label-conversations')}
                  className="btn-link"
                  title="Click to go back to Label Conversations"
                >
                  Label Conversations
                </button>
              ) : (
                getPageTitle(currentPage)
              )}
            </h1>
            
            {currentConversationId && (
              <>
                <CaretRight size={20} className="text-muted-foreground" />
                <span className="text-xl font-semibold text-foreground">
                  {getCurrentConversationTitle()}
                </span>
              </>
            )}
          </div>
          
          <span className="text-sm text-muted-foreground">
            {currentConversationId 
              ? ``
              : getPageDescription(currentPage)
            }
          </span>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
