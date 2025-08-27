import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../../stores/navigationStore';
import { useConversationStore } from '../../stores/conversationStore';
import { useSurveyQuestions } from '../../hooks/useSurveyQuestions';
import { NavigationItem, NavigationItemNested, NavigationSection } from '../common';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { currentPage, setCurrentPage, selectedConversations, removeSelectedConversation, currentConversationId, currentTemplateId } = useNavigationStore();
  const { selectedConversationIds, removeSelectedConversation: removeFromStore, saveSelectedConversationsToStorage } = useConversationStore();
  const { templates } = useSurveyQuestions();
  const navigate = useNavigate();

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'select-conversations':
        return 'Select Conversations';
      case 'label-conversations':
        return 'Label Conversations';
      case 'ai-comparisons':
        return 'AI Comparisons';
      case 'survey-templates':
        return 'Survey Templates';
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

  const getSelectedTemplateTitles = () => {
    if (templates.length === 0) return [];
    
    return templates.slice(0, 3).map(template => ({
      id: template.id,
      title: template.name || 'Untitled Template'
    }));
  };

  const handlePageNavigation = (page: 'select-conversations' | 'label-conversations' | 'ai-comparisons' | 'survey-templates' | 'survey-questions') => {
    setCurrentPage(page);
    navigate(`/${page === 'select-conversations' ? 'select-conversations' : page}`);
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  };

  const handleTemplateClick = (templateId: string) => {
    navigate(`/survey-template/${templateId}`);
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
      const saveResult = await saveSelectedConversationsToStorage();
      
      if (saveResult) {
        // Success
      } else {
        console.error('❌ handleRemoveConversation: Failed to save after deletion');
      }
      
      // If no conversations left and user is on labeling page, redirect to selection page
      if (selectedConversations.length === 1 && currentPage === 'label-conversations') {
        navigate('/select-conversations');
      }
    } catch (error) {
      console.error('❌ handleRemoveConversation: Failed to remove conversation:', error);
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
      id: 'survey-templates',
      label: 'Survey Templates',
      icon: '📝',
      onClick: () => handlePageNavigation('survey-templates'),
      subItems: getSelectedTemplateTitles().slice(0, 3).map(template => ({
        id: template.id,
        label: truncateTitle(template.title),
        onClick: () => handleTemplateClick(template.id)
      }))
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
      <div className="pl-1 pr-1 pt-6 min-w-64">
        <h2 className="text-lg font-semibold text-foreground ml-4 mb-2">Chat Labeling</h2>
        
        <NavigationSection>
          {navigationItems.map((item) => (
            <div key={item.id}>
              <NavigationItem
                icon={item.icon}
                label={item.label}
                isActive={currentPage === item.id && !currentConversationId && !currentTemplateId}
                onClick={item.onClick}
              />
              
              {/* Sub-items for label conversations */}
              {item.id === 'label-conversations' && item.subItems && item.subItems.length > 0 && (
                <div>
                  {item.subItems.map((subItem) => (
                    <NavigationItemNested
                      key={subItem.id}
                      label={subItem.label}
                      isActive={currentConversationId === subItem.id}
                      onClick={subItem.onClick}
                      onRemove={() => handleRemoveConversation(subItem.id)}
                    />
                  ))}
                  
                  {getSelectedConversationTitles().length > 3 && (
                    <button
                      onClick={() => handlePageNavigation('label-conversations')}
                      className="nav-item text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-left"
                    >
                      <span className="text-xs">→</span>
                      <span>See all ({getSelectedConversationTitles().length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Sub-items for survey templates */}
              {item.id === 'survey-templates' && item.subItems && item.subItems.length > 0 && (
                <div>
                  {item.subItems.map((subItem) => (
                    <NavigationItemNested
                      key={subItem.id}
                      label={subItem.label}
                      isActive={currentTemplateId === subItem.id}
                      onClick={subItem.onClick}
                    />
                  ))}
                  
                  {getSelectedTemplateTitles().length > 3 && (
                    <button
                      onClick={() => handlePageNavigation('survey-templates')}
                      className="nav-item text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-left"
                    >
                      <span className="text-xs">→</span>
                      <span>See all ({getSelectedTemplateTitles().length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </NavigationSection>
        
      </div>
    </aside>
  );
};

export default Sidebar;
