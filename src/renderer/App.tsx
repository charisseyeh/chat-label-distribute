import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ConversationList from './components/conversation/ConversationList';
import ConversationViewer from './components/conversation/ConversationViewer';
import SurveyForm from './components/survey/SurveyForm';
import AIAnalysis from './components/ai-analysis/AIAnalysis';
import ExportPanel from './components/export/ExportPanel';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/" element={<ConversationList />} />
              <Route path="/conversations" element={<ConversationList />} />
              <Route path="/conversations/:id" element={<ConversationViewer />} />
              <Route path="/survey" element={<SurveyForm />} />
              <Route path="/ai-analysis" element={<AIAnalysis />} />
              <Route path="/export" element={<ExportPanel />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
