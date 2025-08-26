import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
