import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/layout/Header';
import Sidebar from './components/common/layout/Sidebar';
import Footer from './components/common/layout/Footer';
import ConversationSelectorPage from './pages/ConversationSelectorPage';
import LabelConversationsPage from './pages/LabelConversationsPage';
import ConversationPage from './pages/ConversationPage';
import AIComparisonsPage from './pages/AIComparisonsPage';
import AssessmentQuestionsPage from './pages/AssessmentQuestionsPage';
import AssessmentTemplatesPage from './pages/AssessmentTemplatesPage';
import { useNavigationSync, useStartupLoading, useStoreSync } from './hooks/core';

// Component to sync navigation store with route changes
const NavigationSync: React.FC = React.memo(() => {
  useNavigationSync();
  return null;
});

NavigationSync.displayName = 'NavigationSync';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Use custom hooks for better separation of concerns
  useStartupLoading();
  useStoreSync();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col">
          <Header isSidebarOpen={isSidebarOpen} />
          {/* All pages use the normal layout with proper routing */}
          <main className="flex-1 overflow-hidden">
            <NavigationSync />
            <Routes>
              <Route path="/" element={<ConversationSelectorPage />} />
              <Route path="/select-conversations" element={<ConversationSelectorPage />} />
              <Route path="/label-conversations" element={<LabelConversationsPage />} />
              <Route path="/conversation/:id" element={<ConversationPage />} />
              <Route path="/assessment-templates" element={<AssessmentTemplatesPage />} />
              <Route path="/assessment-template/:id" element={<AssessmentQuestionsPage />} />
              <Route path="/ai-comparisons" element={<AIComparisonsPage />} />
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
