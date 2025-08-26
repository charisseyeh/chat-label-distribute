import React from 'react';

interface TwoPanelLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  sidebarWidth?: string;
  className?: string;
}

const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  children,
  sidebarContent,
  sidebarWidth = "w-80",
  className = ""
}) => {
  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Main Content Panel - Flexible width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-full p-6 w-full">
          {children}
        </div>
      </div>

      {/* Right Sidebar Panel - Fixed width */}
      <div className={`${sidebarWidth} bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-y-auto`}>
        {sidebarContent}
      </div>
    </div>
  );
};

export default TwoPanelLayout;
