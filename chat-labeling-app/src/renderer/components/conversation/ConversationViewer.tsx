import React from 'react';

const ConversationViewer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Conversation Viewer</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze conversation details
        </p>
      </div>
      
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Conversation Viewer
          </h3>
          <p className="text-muted-foreground">
            This component will display the selected conversation with messages and analysis options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationViewer;
