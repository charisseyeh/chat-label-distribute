import React from 'react';
import { List, X } from '@phosphor-icons/react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <X size={20} /> : <List size={20} />}
          </button>
          <h1 className="text-2xl font-bold text-foreground">JSON File Reader</h1>
          <span className="text-sm text-muted-foreground">Simple JSON file viewing and analysis</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Select any JSON file to view its contents
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
