import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/layout/Header';
import Sidebar from './components/common/layout/Sidebar';
import Footer from './components/common/layout/Footer';
import ConversationSelectorPage from './pages/ConversationSelectorPage';
import LabelConversations from './components/conversation/management/LabelConversations';
import ConversationPage from './pages/ConversationPage';
import AIComparisonsPage from './pages/AIComparisonsPage';
import SurveyQuestionsPage from './pages/SurveyQuestionsPage';
import SurveyTemplatesPage from './pages/SurveyTemplatesPage';
import { useConversationStore } from './stores/conversationStore';
import { useNavigationStore } from './stores/navigationStore';
import { performanceMonitor } from './utils/performance';

// Component to sync navigation store with route changes
const NavigationSync: React.FC = React.memo(() => {
  const location = useLocation();
  const { batchUpdate } = useNavigationStore();

  // Memoize the navigation logic to prevent unnecessary recalculations
  const navigationConfig = useMemo(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '/select-conversations') {
      return { page: 'select-conversations' as const, conversationId: null, templateId: undefined };
    } else if (path === '/label-conversations') {
      return { page: 'label-conversations' as const, conversationId: null, templateId: undefined };
    } else if (path === '/ai-comparisons') {
      return { page: 'ai-comparisons' as const, conversationId: null, templateId: undefined };
    } else if (path === '/survey-templates') {
      return { page: 'survey-templates' as const, conversationId: null, templateId: undefined };
    } else if (path.startsWith('/conversation/')) {
      const conversationId = path.split('/conversation/')[1];
      return { page: 'label-conversations' as const, conversationId, templateId: undefined };
    } else if (path.startsWith('/survey-template/')) {
      const templateId = path.split('/survey-template/')[1];
      return { page: 'survey-questions' as const, conversationId: null, templateId };
    }
    
    return { page: 'select-conversations' as const, conversationId: null, templateId: undefined };
  }, [location.pathname]);

  useEffect(() => {
    const { page, conversationId, templateId } = navigationConfig;
    
    // Track navigation performance
    const route = location.pathname;
    performanceMonitor.startNavigation(route);
    
    // Use batch update for better performance - single state update instead of three
    // Only update templateId if it's explicitly provided (not undefined)
    const updates: any = {
      currentPage: page,
      currentConversationId: conversationId
    };
    
    if (templateId !== undefined) {
      updates.currentTemplateId = templateId;
    }
    
    batchUpdate(updates);
    
    // Mark navigation as complete after state update
    requestAnimationFrame(() => {
      performanceMonitor.endNavigation(route);
    });
  }, [navigationConfig, batchUpdate, location.pathname]);

  return null;
});

NavigationSync.displayName = 'NavigationSync';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { loadSelectedConversationsFromStorage, selectedConversations } = useConversationStore();
  const { setSelectedConversations } = useNavigationStore();

  // Load selected conversations from permanent storage on app startup
  useEffect(() => {
    const loadOnStartup = async () => {
      try {
        await loadSelectedConversationsFromStorage();
      } catch (error) {
        console.warn('Failed to load selected conversations on startup:', error);
      }
    };
    loadOnStartup();
  }, [loadSelectedConversationsFromStorage]);

  // Synchronize navigation store with conversation store when selected conversations change
  useEffect(() => {
    if (selectedConversations.length > 0) {
      // Sync the navigation store with the conversation store
      setSelectedConversations(selectedConversations.map(conv => ({
        id: conv.id,
        title: conv.title
      })));
    } else {
      // Clear the navigation store if there are no selected conversations
      setSelectedConversations([]);
    }
  }, [selectedConversations, setSelectedConversations]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Header isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 overflow-hidden">
            <NavigationSync />
            <Routes>
              <Route path="/" element={<ConversationSelectorPage />} />
              <Route path="/select-conversations" element={<ConversationSelectorPage />} />
              <Route path="/label-conversations" element={<LabelConversations />} />
              <Route path="/conversation/:id" element={<ConversationPage />} />
              <Route path="/ai-comparisons" element={<AIComparisonsPage />} />
              <Route path="/survey-templates" element={<SurveyTemplatesPage />} />
              <Route path="/survey-template/:id" element={<SurveyQuestionsPage />} />
              <Route path="*" element={<ConversationSelectorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
