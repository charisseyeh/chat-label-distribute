import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigationStore';
import { useConversationStore } from '../../stores/conversationStore';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { currentPage, setCurrentPage, selectedConversations, removeSelectedConversation, currentConversationId } = useNavigationStore();
  const { selectedConversationIds, removeSelectedConversation: removeFromStore, saveSelectedConversationsToStorage } = useConversationStore();
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

  const handleRemoveConversation = async (conversationId: string) => {
    try {
      // Get conversation title for confirmation
      const conversation = selectedConversations.find(conv => conv.id === conversationId);
      const title = conversation?.title || 'this conversation';
      
      // Ask for confirmation
      if (!window.confirm(`Are you sure you want to remove "${title}" from your selection? This action cannot be undone.`)) {
        return;
      }
      
      // Check if user is currently viewing this conversation
      const currentPath = window.location.pathname;
      if (currentPath === `/conversation/${conversationId}`) {
        // Redirect to label conversations page if viewing the removed conversation
        navigate('/label-conversations');
      }
      
      // Remove from navigation store
      removeSelectedConversation(conversationId);
      
      // Remove from conversation store
      removeFromStore(conversationId);
      
      // Save updated selection to permanent storage
      await saveSelectedConversationsToStorage();
      
      // If no conversations left and user is on labeling page, redirect to selection page
      if (selectedConversations.length === 1 && currentPage === 'label-conversations') {
        navigate('/select-conversations');
      }
    } catch (error) {
      console.error('Failed to remove conversation:', error);
    }
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
                  currentPage === item.id || (item.id === 'label-conversations' && currentConversationId)
                    ? 'bg-primary-100 text-primary-900 border border-primary-200'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
              
              {/* Sub-items for label conversations */}
              {item.id === 'label-conversations' && item.subItems && item.subItems.length > 0 && (
                <div className="mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.id} className="group">
                      <div className="flex items-center justify-between px-3 py-2 rounded text-sm transition-colors duration-200 group ${
                        currentConversationId === subItem.id
                          ? 'text-blue-600 bg-blue-50 border border-blue-200 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }">
                        <button
                          onClick={subItem.onClick}
                          className="flex-1 text-left cursor-pointer truncate"
                          title={`Click to view: ${subItem.label}`}
                        >
                          {subItem.label}
                        </button>
                        <button
                          onClick={() => handleRemoveConversation(subItem.id)}
                          className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2"
                          title={`Remove ${subItem.label} from selection`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
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
        
      </div>
    </aside>
  );
};

export default Sidebar;
