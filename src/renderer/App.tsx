import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ConversationDisplay from './components/conversation/ConversationDisplay';
import LabelConversations from './components/conversation/LabelConversations';
import ConversationViewer from './components/conversation/ConversationViewer';
import AIComparisons from './components/ai-analysis/AIComparisons';
import { useConversationStore } from './stores/conversationStore';

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
            <Routes>
              <Route path="/" element={<ConversationDisplay />} />
              <Route path="/select-conversations" element={<ConversationDisplay />} />
              <Route path="/label-conversations" element={<LabelConversations />} />
              <Route path="/conversation/:id" element={<ConversationViewer />} />
              <Route path="/ai-comparisons" element={<AIComparisons />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
