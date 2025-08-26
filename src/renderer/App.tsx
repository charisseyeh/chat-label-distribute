import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ConversationBrowser from './components/conversation/ConversationBrowser';
import LabelConversations from './components/conversation/LabelConversations';
import ConversationViewer from './components/conversation/ConversationViewer';
import AIComparisons from './components/ai-analysis/AIComparisons';
import SurveyQuestionsPage from './pages/SurveyQuestionsPage';
import { useConversationStore } from './stores/conversationStore';
import { useNavigationStore } from './stores/navigationStore';

// Component to sync navigation store with route changes
const NavigationSync: React.FC = () => {
  const location = useLocation();
  const { setCurrentPage } = useNavigationStore();

  useEffect(() => {
    const path = location.pathname;
    
    // Map routes to page types
    if (path === '/' || path === '/select-conversations') {
      setCurrentPage('select-conversations');
    } else if (path === '/label-conversations') {
      setCurrentPage('label-conversations');
    } else if (path === '/ai-comparisons') {
      setCurrentPage('ai-comparisons');
    } else if (path === '/survey-questions') {
      setCurrentPage('survey-questions');
    } else if (path.startsWith('/conversation/')) {
      // Keep current page for conversation viewer
      // Don't change navigation state
    }
  }, [location.pathname, setCurrentPage]);

  return null;
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loadSelectedConversationsFromStorage } = useConversationStore();

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col">
          <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-auto p-6">
            <NavigationSync />
            <Routes>
              <Route path="/" element={<ConversationBrowser />} />
              <Route path="/select-conversations" element={<ConversationBrowser />} />
              <Route path="/label-conversations" element={<LabelConversations />} />
              <Route path="/conversation/:id" element={<ConversationViewer />} />
              <Route path="/ai-comparisons" element={<AIComparisons />} />
              <Route path="/survey-questions" element={<SurveyQuestionsPage />} />
              <Route path="*" element={<ConversationBrowser />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
