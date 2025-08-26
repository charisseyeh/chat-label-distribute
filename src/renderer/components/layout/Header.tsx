import React from 'react';
import { List, X } from '@phosphor-icons/react';
import { useNavigationStore } from '../../stores/navigationStore';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const { currentPage } = useNavigationStore();

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'select-conversations':
        return 'Select Conversations';
      case 'label-conversations':
        return 'Label Conversations';
      case 'ai-comparisons':
        return 'AI Comparisons';
      case 'survey-questions':
        return 'Survey Questions';
      default:
        return 'Unknown Page';
    }
  };

  const getPageDescription = (page: string) => {
    switch (page) {
      case 'select-conversations':
        return 'Select conversations to analyze and label';
      case 'label-conversations':
        return 'Label and categorize selected conversations';
      case 'ai-comparisons':
        return 'Compare AI model performance across conversations';
      case 'survey-questions':
        return 'Create and manage survey templates and questions';
      default:
        return 'Navigation and analysis tools';
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">{getPageTitle(currentPage)}</h1>
          <span className="text-sm text-muted-foreground">{getPageDescription(currentPage)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {getPageDescription(currentPage)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
