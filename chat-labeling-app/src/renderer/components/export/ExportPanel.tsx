import React from 'react';

const ExportPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Export</h1>
        <p className="text-muted-foreground mt-2">
          Export labeled datasets for research and analysis
        </p>
      </div>
      
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Export System
          </h3>
          <p className="text-muted-foreground">
            This component will handle data export in various formats.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
