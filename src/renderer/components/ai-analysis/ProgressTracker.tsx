import React from 'react';

interface GenerationProgress {
  currentTrial: number;
  totalTrials: number;
  currentConversation: number;
  totalConversations: number;
  currentPosition: number;
  totalPositions: number;
  status: 'connecting' | 'generating' | 'processing' | 'complete' | 'error';
  currentOperation: string;
  currentPrompt: string;
  error?: string;
}

interface ProgressTrackerProps {
  progress: GenerationProgress;
  storeConversations: any[];
  selectedConversations: string[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  storeConversations,
  selectedConversations
}) => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-800">
          {progress.status === 'connecting' && '🔌 Connecting to OpenAI...'}
          {progress.status === 'generating' && '🤖 Generating AI responses...'}
          {progress.status === 'processing' && '⚙️ Processing results...'}
          {progress.status === 'complete' && '✅ Generation complete!'}
          {progress.status === 'error' && '❌ Error occurred'}
        </h4>
        <span className="text-xs text-blue-600">
          Trial {progress.currentTrial}/{progress.totalTrials}
        </span>
      </div>

      {/* Error Display */}
      {progress.status === 'error' && progress.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h5 className="text-sm font-medium text-red-800 mb-2">API Error:</h5>
          <p className="text-sm text-red-700">{progress.error}</p>
          <p className="text-xs text-red-600 mt-2">
            Please check your API key and try again. If the problem persists, check your OpenAI account status.
          </p>
        </div>
      )}
      
      {/* Progress Bars */}
      <div className="space-y-2 mb-3">
        {/* Trial Progress */}
        <div className="flex items-center justify-between text-xs text-blue-700">
          <span>Trial Progress</span>
          <span>{progress.currentTrial}/{progress.totalTrials}</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(progress.currentTrial / progress.totalTrials) * 100}%` }}
          ></div>
        </div>
        
        {/* Conversation Progress */}
        {progress.totalConversations > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-blue-700">
              <span>Conversation Progress</span>
              <span>{progress.currentConversation}/{progress.totalConversations}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(progress.currentConversation / progress.totalConversations) * 100}%` }}
              ></div>
            </div>
          </>
        )}
        
        {/* Position Progress */}
        {progress.totalPositions > 0 && (
          <>
            <div className="flex items-center justify-between text-xs text-blue-700">
              <span>Position Progress</span>
              <span>{progress.currentPosition}/{progress.totalPositions}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(progress.currentPosition / progress.totalPositions) * 100}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
      
      {/* Current Operation */}
      <div className="text-xs text-blue-700">
        <p className="font-medium">Current Operation:</p>
        <p className="italic">{progress.currentOperation}</p>
      </div>

      {/* Current Prompt Display */}
      {progress.currentOperation.includes('position') && (
        <div className="mt-3 p-3 bg-white border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700 font-medium mb-2">Current Prompt Being Processed:</p>
          <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto max-h-32">
            <pre className="whitespace-pre-wrap">
              {progress.currentPrompt}
            </pre>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <p><strong>Current Conversation:</strong> {(() => {
              const currentConv = storeConversations.find(c => c.id === selectedConversations[progress.currentConversation - 1]);
              return currentConv?.title || 'Unknown';
            })()}</p>
            <p><strong>Current Trial:</strong> {progress.currentTrial}</p>
            <p><strong>Current Position:</strong> {(() => {
              const positions = ['beginning', 'turn6', 'end'];
              return positions[progress.currentPosition - 1] || 'Unknown';
            })()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
