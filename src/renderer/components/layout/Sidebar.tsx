import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigationStore';
import { useConversationStore } from '../../stores/conversationStore';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { currentPage, setCurrentPage, selectedConversations } = useNavigationStore();
  const { selectedConversationIds } = useConversationStore();
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

  const truncateTitle = (title: string, maxLength: number = 20) => {
    if (!title) return 'Untitled';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  const getSelectedConversationTitles = () => {
    if (selectedConversations.length === 0) return [];
    
    return selectedConversations.slice(0, 3).map(conv => ({
      id: conv.id,
      title: conv.title
    }));
  };

  const handlePageNavigation = (page: 'select-conversations' | 'label-conversations' | 'ai-comparisons' | 'survey-questions') => {
    setCurrentPage(page);
    navigate(`/${page === 'select-conversations' ? 'select-conversations' : page}`);
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  const navigationItems = [
    {
      id: 'select-conversations',
      label: 'Select Conversations',
      icon: '📋',
      onClick: () => handlePageNavigation('select-conversations')
    },
    {
      id: 'label-conversations',
      label: 'Label Conversations',
      icon: '🏷️',
      onClick: () => handlePageNavigation('label-conversations'),
      subItems: getSelectedConversationTitles().slice(0, 3).map(conv => ({
        id: conv.id,
        label: truncateTitle(conv.title),
        onClick: () => handleConversationClick(conv.id)
      }))
    },
    {
      id: 'survey-questions',
      label: 'Survey Questions',
      icon: '📝',
      onClick: () => handlePageNavigation('survey-questions')
    },
    {
      id: 'ai-comparisons',
      label: 'AI Comparisons',
      icon: '🤖',
      onClick: () => handlePageNavigation('ai-comparisons')
    }
  ];

  return (
    <aside
      className={`bg-muted border-r border-border transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-6 min-w-64">
        <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                  currentPage === item.id
                    ? 'bg-primary-100 text-primary-900 border border-primary-200'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
              
              {/* Sub-items for label conversations */}
              {item.id === 'label-conversations' && item.subItems && item.subItems.length > 0 && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={subItem.onClick}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200 text-left cursor-pointer group"
                      title={`Click to view: ${subItem.label}`}
                    >
                      <span className="text-xs text-blue-500 group-hover:text-blue-600">•</span>
                      <span className="truncate group-hover:text-blue-600 transition-colors">{subItem.label}</span>
                    </button>
                  ))}
                  
                  {getSelectedConversationTitles().length > 3 && (
                    <button
                      onClick={() => handlePageNavigation('label-conversations')}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 text-left"
                    >
                      <span className="text-xs">→</span>
                      <span>See all ({getSelectedConversationTitles().length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Page</h3>
          <p className="text-sm text-foreground font-medium">
            {getPageTitle(currentPage)}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
