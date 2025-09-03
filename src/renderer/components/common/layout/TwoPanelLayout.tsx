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
  sidebarWidth = "w-[30%]",
  className = ""
}) => {
  return (
    <div className={`flex h-screen max-h-screen overflow-hidden`}>
      {/* Main Content Panel - Flexible width */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Right Sidebar Panel - Fixed width */}
      <div className={`${sidebarWidth} flex flex-col h-full border-l border-gray-200 overflow-y-auto`}>
        {sidebarContent}
      </div>
    </div>
  );
};

export default TwoPanelLayout;
