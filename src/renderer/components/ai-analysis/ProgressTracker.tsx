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
  // Calculate overall progress
  const totalOperations = progress.totalTrials * progress.totalConversations * progress.totalPositions;
  const completedOperations = (progress.currentTrial - 1) * progress.totalConversations * progress.totalPositions +
    (progress.currentConversation - 1) * progress.totalPositions +
    (progress.currentPosition - 1);
  const overallProgress = totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0;

  // Get current conversation title
  const currentConversationTitle = (() => {
    const currentConv = storeConversations.find(c => c.id === selectedConversations[progress.currentConversation - 1]);
    return currentConv?.title || 'Unknown';
  })();

  return (
    <div className="space-y-2">
      {/* Header with animated ellipsis */}
      <h3 className="text-h3 mb-2">
        AI labeling conversations...
      </h3>
      
      {/* Current conversation being labeled */}
      <h3 className="text-size-body">
        Labeling "{currentConversationTitle}"
      </h3>

      {/* Single progress bar */}
      <div className="w-full bg-blue-200 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressTracker;
