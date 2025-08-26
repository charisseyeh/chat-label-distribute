import React from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`bg-muted border-r border-border transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-6 min-w-64">
        <h2 className="text-lg font-semibold text-foreground mb-6">JSON File Reader</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-primary-100 text-primary-900 border border-primary-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📄</span>
              <span className="font-medium">File Reader</span>
            </div>
            <p className="text-sm mt-2 text-primary-700">
              Select and read JSON files to view their content
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">About</h3>
          <p className="text-sm text-muted-foreground">
            Simple JSON file reader for viewing conversation data and other JSON content.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
