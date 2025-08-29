import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar as SidebarIcon, X, ClipboardText, Tag, FileText, Robot, SidebarSimpleIcon } from '@phosphor-icons/react';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useConversationStore } from '../../../stores/conversationStore';
import { useSurveyQuestions } from '../../../hooks/survey/useSurveyQuestions';
import { NavigationItem, NavigationItemNested, NavigationSection } from '../navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ isOpen, onToggleSidebar }) => {
  const { currentPage, setCurrentPage, selectedConversations, removeSelectedConversation, currentConversationId, currentTemplateId } = useNavigationStore();
  const { selectedConversationIds, removeSelectedConversation: removeFromStore, saveSelectedConversationsToStorage } = useConversationStore();
  const { templates } = useSurveyQuestions();
  const navigate = useNavigate();

  const getPageTitle = useCallback((page: string) => {
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
  }, []);

  const truncateTitle = useCallback((title: string, maxLength: number = 20) => {
    if (!title) return 'Untitled';
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  }, []);

  const getSelectedConversationTitles = useMemo(() => {
    if (selectedConversations.length === 0) return [];
    
    return selectedConversations.slice(0, 3).map(conv => ({
      id: conv.id,
      title: conv.title
    }));
  }, [selectedConversations]);

  const getSelectedTemplateTitles = useMemo(() => {
    if (templates.length === 0) return [];
    
    return templates.slice(0, 3).map(template => ({
      id: template.id,
      title: template.name || 'Untitled Template'
    }));
  }, [templates]);

  const handlePageNavigation = useCallback((page: 'select-conversations' | 'label-conversations' | 'ai-comparisons' | 'survey-templates' | 'survey-questions') => {
    setCurrentPage(page);
    navigate(`/${page === 'select-conversations' ? 'select-conversations' : page}`);
  }, [setCurrentPage, navigate]);

  const handleConversationClick = useCallback((conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
  }, [navigate]);

  const handleTemplateClick = useCallback((templateId: string) => {
    navigate(`/survey-template/${templateId}`);
  }, [navigate]);

  const handleRemoveConversation = useCallback(async (conversationId: string) => {
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
  }, [selectedConversations, currentPage, removeSelectedConversation, removeFromStore, saveSelectedConversationsToStorage, navigate]);

  // Helper function to determine if a navigation item should be active
  const isNavigationItemActive = useCallback((itemId: string) => {
    // If we're viewing a specific conversation, only that should be active
    if (currentConversationId) {
      return false;
    }
    
    // If we're viewing a specific template, only that should be active
    if (currentTemplateId) {
      return false;
    }
    
    // Otherwise, check if the current page matches the item
    return currentPage === itemId;
  }, [currentConversationId, currentTemplateId, currentPage]);

  const navigationItems = useMemo(() => [
    {
      id: 'select-conversations',
      label: 'Select Conversations',
      icon: <ClipboardText size={20} weight="bold" />,
      onClick: () => handlePageNavigation('select-conversations')
    },
    {
      id: 'label-conversations',
      label: 'Label Conversations',
      icon: <Tag size={20} weight="bold" />,
      onClick: () => handlePageNavigation('label-conversations'),
      subItems: getSelectedConversationTitles.slice(0, 3).map(conv => ({
        id: conv.id,
        label: truncateTitle(conv.title),
        onClick: () => handleConversationClick(conv.id)
      }))
    },
    {
      id: 'survey-templates',
      label: 'Survey Templates',
      icon: <FileText size={20} weight="bold" />,
      onClick: () => handlePageNavigation('survey-templates'),
      subItems: getSelectedTemplateTitles.slice(0, 3).map(template => ({
        id: template.id,
        label: truncateTitle(template.title),
        onClick: () => handleTemplateClick(template.id)
      }))
    },
    {
      id: 'ai-comparisons',
      label: 'AI Comparisons',
      icon: <Robot size={20} weight="bold" />,
      onClick: () => handlePageNavigation('ai-comparisons')
    }
  ], [getSelectedConversationTitles, getSelectedTemplateTitles, truncateTitle, handlePageNavigation, handleConversationClick, handleTemplateClick]);

  return (
    <aside
      className={`bg-muted border-r border-border transition-all duration-200 ease-out ${
        isOpen ? 'w-64' : 'w-16'
      } ${isOpen ? '' : 'overflow-visible'}`}
    >
      {/* Header with toggle button */}
      <div className={`flex items-center justify-between mt-2 p-4 ${
        isOpen ? '' : 'justify-center'
      }`}>
        <h2 className={`text-lg font-semibold text-foreground transition-all duration-200 delay-100 ${
          isOpen ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0 overflow-hidden'
        }`}>
          Chat Labeling
        </h2>
        <button
          onClick={onToggleSidebar}
          className="btn-icon"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? <SidebarSimpleIcon size={20} weight="fill" />  : <SidebarSimpleIcon size={20} weight="bold" />}
        </button>
      </div>
      
      {/* Collapsed state navigation - icons only */}
      {!isOpen && (
        <div className="flex flex-col items-center space-y-2">
          {navigationItems.map((item) => {
            // Clone the icon and change weight to "fill" if active
            const iconElement = React.cloneElement(item.icon as React.ReactElement, {
              weight: isNavigationItemActive(item.id) ? "fill" : "bold"
            });

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isNavigationItemActive(item.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
                }`}
                title={item.label}
              >
                {iconElement}
              </button>
            );
          })}
        </div>
      )}
      
      <div className={`pl-1 pr-1 pt-6 transition-all duration-200 delay-100 ${
        isOpen ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0 overflow-hidden'
      }`}>
        <NavigationSection>
          {navigationItems.map((item) => {
            // Clone the icon and change weight to "fill" if active (same logic as collapsed state)
            const iconElement = React.cloneElement(item.icon as React.ReactElement, {
              weight: isNavigationItemActive(item.id) ? "fill" : "bold"
            });

            return (
              <div key={item.id}>
                <NavigationItem
                  icon={iconElement}
                  label={item.label}
                  isActive={isNavigationItemActive(item.id)}
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
                    
                    {getSelectedConversationTitles.length > 3 && (
                      <button
                        onClick={() => handlePageNavigation('label-conversations')}
                        className="nav-item text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-left"
                      >
                        <span className="text-xs">→</span>
                        <span>See all ({getSelectedConversationTitles.length})</span>
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
                    
                    {getSelectedTemplateTitles.length > 3 && (
                      <button
                        onClick={() => handlePageNavigation('survey-templates')}
                        className="nav-item text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-left"
                      >
                        <span className="text-xs">→</span>
                        <span>See all ({getSelectedTemplateTitles.length})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </NavigationSection>
        
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
