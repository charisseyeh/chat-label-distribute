import React from 'react';

const SurveyForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Survey Form</h1>
        <p className="text-muted-foreground mt-2">
          Rate conversations across multiple dimensions
        </p>
      </div>
      
      <div className="card">
        <div className="card-content text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Survey System
          </h3>
          <p className="text-muted-foreground">
            This component will provide the rating interface for conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
