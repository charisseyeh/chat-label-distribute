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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 pb-24 w-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Right Sidebar Panel - Fixed width */}
      <div className={`${sidebarWidth} flex flex-col h-full`}>
        {sidebarContent}
      </div>
    </div>
  );
};

export default TwoPanelLayout;
