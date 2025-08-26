import React from 'react';

const AIComparisons: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Comparisons</h2>
        <p className="text-gray-600">
          Compare different AI models and analyze their performance across conversations.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Comparison Interface</h3>
          <p className="text-sm text-gray-600">
            This page will contain tools for comparing AI model performance, analyzing response quality,
            and generating insights across multiple conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIComparisons;
