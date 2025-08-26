import React from 'react';

const AIAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Generate and compare AI-generated labels
        </p>
      </div>
      
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            AI Labeling System
          </h3>
          <p className="text-muted-foreground">
            This component will handle OpenAI API integration and label comparison.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
