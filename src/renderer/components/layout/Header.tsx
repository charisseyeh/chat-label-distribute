import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">Chat Labeling App</h1>
          <span className="text-sm text-muted-foreground">Conversation Analysis & AI Labeling</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="btn-outline">
            Import Conversation
          </button>
          <button className="btn-primary">
            Export Data
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
