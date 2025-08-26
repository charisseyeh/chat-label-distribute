import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ConversationDisplay from './components/conversation/ConversationDisplay';

function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ConversationDisplay />
        </main>
      </div>
    </div>
  );
}

export default App;
