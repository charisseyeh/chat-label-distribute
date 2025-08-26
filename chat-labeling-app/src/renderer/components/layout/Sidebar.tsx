import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/conversations', label: 'Conversations', icon: '💬' },
    { path: '/survey', label: 'Survey', icon: '📝' },
    { path: '/ai-analysis', label: 'AI Analysis', icon: '🤖' },
    { path: '/export', label: 'Export', icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-muted border-r border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 border border-primary-200'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <button className="w-full btn-primary text-sm">
            + New Import
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
