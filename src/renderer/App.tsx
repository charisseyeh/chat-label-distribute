import React, { useState, useEffect } from 'react';
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

// Component to sync navigation store with route changes
const NavigationSync: React.FC = () => {
  const location = useLocation();
  const { setCurrentPage, setCurrentConversationId, setCurrentTemplateId } = useNavigationStore();

  useEffect(() => {
    const path = location.pathname;
    
    // Map routes to page types
    if (path === '/' || path === '/select-conversations') {
      setCurrentPage('select-conversations');
      setCurrentConversationId(null);
      setCurrentTemplateId(null);
    } else if (path === '/label-conversations') {
      setCurrentPage('label-conversations');
      setCurrentConversationId(null);
      setCurrentTemplateId(null);
    } else if (path === '/ai-comparisons') {
      setCurrentPage('ai-comparisons');
      setCurrentConversationId(null);
      setCurrentTemplateId(null);
    } else if (path === '/survey-templates') {
      setCurrentPage('survey-templates');
      setCurrentConversationId(null);
      setCurrentTemplateId(null);
    } else if (path === '/survey-questions') {
      setCurrentPage('survey-questions');
      setCurrentConversationId(null);
      setCurrentTemplateId(null);
    } else if (path.startsWith('/conversation/')) {
      // Extract conversation ID from path
      const conversationId = path.split('/conversation/')[1];
      setCurrentConversationId(conversationId);
      setCurrentTemplateId(null);
      // Keep current page as 'label-conversations' for breadcrumb context
    } else if (path.startsWith('/survey-template/')) {
      // Extract template ID from path
      const templateId = path.split('/survey-template/')[1];
      setCurrentTemplateId(templateId);
      setCurrentConversationId(null);
      // Keep current page as 'survey-templates' for breadcrumb context
    }
  }, [location.pathname, setCurrentPage, setCurrentConversationId, setCurrentTemplateId]);

  return null;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
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
              <Route path="/survey-questions" element={<SurveyQuestionsPage />} />
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
