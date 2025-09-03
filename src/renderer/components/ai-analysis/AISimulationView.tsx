import React, { useState, useEffect } from 'react';
import ProgressTracker from './ProgressTracker';
import ComparisonResultsDisplay from './ComparisonResultsDisplay';

interface AISimulationViewProps {
  currentTemplate: any;
  selectedConversations: string[];
  storeConversations: any[];
  generateOpenAIPrompt: (context: string, position: 'beginning' | 'turn6' | 'end') => string | null;
}

const AISimulationView: React.FC<AISimulationViewProps> = ({
  currentTemplate,
  selectedConversations,
  storeConversations,
  generateOpenAIPrompt
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState({
    currentTrial: 1,
    totalTrials: 3,
    currentConversation: 1,
    totalConversations: selectedConversations.length || 2,
    currentPosition: 1,
    totalPositions: 3,
    status: 'generating' as 'connecting' | 'generating' | 'processing' | 'complete' | 'error',
    currentOperation: 'Generating AI responses for conversation analysis...',
    currentPrompt: `You are an AI assistant analyzing customer service conversations. Please evaluate the following conversation based on the criteria provided in the survey template.

Conversation Context: Customer inquiry about product return policy
Position: Beginning of conversation
Trial: 1 of 3

Please provide your analysis focusing on:
1. Customer satisfaction indicators
2. Agent response quality
3. Resolution effectiveness
4. Overall conversation flow

[Conversation content would be inserted here]`,
    error: undefined as string | undefined
  });

  // Mock conversation data for simulation
  const mockConversations = [
    {
      id: 'conv-1',
      title: 'Customer Service - Product Return Inquiry',
      data: {},
      hasResponses: true,
      messageCount: 12
    },
    {
      id: 'conv-2', 
      title: 'Technical Support - Login Issues',
      data: {},
      hasResponses: true,
      messageCount: 8
    }
  ];

  const mockSelectedConversations = ['conv-1', 'conv-2'];

  // Mock comparison data for when simulation is complete
  const mockComparisonData = [
    {
      conversationId: 'conv-1',
      conversationTitle: 'Customer Service - Product Return Inquiry',
      humanResponses: {
        'Customer Satisfaction': 4.0,
        'Agent Response Quality': 4.5,
        'Resolution Effectiveness': 4.2
      },
      aiResponses: {
        'Customer Satisfaction': 4.3,
        'Agent Response Quality': 4.4,
        'Resolution Effectiveness': 4.1
      },
      agreement: 0.85,
      differences: [
        {
          question: 'Customer Satisfaction',
          humanScore: 4.0,
          aiScore: 4.3,
          difference: 0.3
        }
      ]
    },
    {
      conversationId: 'conv-2',
      conversationTitle: 'Technical Support - Login Issues',
      humanResponses: {
        'Customer Satisfaction': 3.8,
        'Agent Response Quality': 4.2,
        'Resolution Effectiveness': 3.9
      },
      aiResponses: {
        'Customer Satisfaction': 4.0,
        'Agent Response Quality': 4.1,
        'Resolution Effectiveness': 4.0
      },
      agreement: 0.92,
      differences: []
    }
  ];

  const mockTrialComparisons = [
    {
      trial: 1,
      conversations: [
        {
          id: 'conv-1',
          title: 'Customer Service - Product Return Inquiry',
          scores: { 'Customer Satisfaction': 4.3, 'Agent Response Quality': 4.5 }
        }
      ]
    }
  ];

  // Simulate progress updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        let newProgress = { ...prev };
        
        // Simulate different stages
        if (prev.status === 'generating') {
          if (prev.currentPosition < prev.totalPositions) {
            newProgress.currentPosition += 1;
            newProgress.currentOperation = `Processing position ${prev.currentPosition + 1} of ${prev.totalPositions}...`;
          } else if (prev.currentConversation < prev.totalConversations) {
            newProgress.currentConversation += 1;
            newProgress.currentPosition = 1;
            newProgress.currentOperation = `Moving to conversation ${prev.currentConversation + 1} of ${prev.totalConversations}...`;
          } else if (prev.currentTrial < prev.totalTrials) {
            newProgress.currentTrial += 1;
            newProgress.currentConversation = 1;
            newProgress.currentPosition = 1;
            newProgress.currentOperation = `Starting trial ${prev.currentTrial + 1} of ${prev.totalTrials}...`;
          } else {
            newProgress.status = 'complete';
            newProgress.currentOperation = 'Analysis complete! All trials finished.';
            setIsSimulating(false);
          }
        }
        
        return newProgress;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(prev => ({
      ...prev,
      status: 'generating',
      currentTrial: 1,
      currentConversation: 1,
      currentPosition: 1,
      currentOperation: 'Starting AI analysis simulation...'
    }));
  };

  const completeSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(prev => ({
      ...prev,
      status: 'complete',
      currentOperation: 'Analysis complete! All trials finished.'
    }));
  };

  const simulateError = () => {
    setIsSimulating(false);
    setSimulationProgress(prev => ({
      ...prev,
      status: 'error',
      error: 'Simulated API error for testing purposes'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-medium text-gray-800 mb-3">AI Analysis Simulation</h3>
        <p className="text-sm text-gray-600 mb-4">
          This shows how the ProgressTracker and results would appear in the main content area during actual AI analysis.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="btn btn-primary btn-sm"
          >
            {isSimulating ? 'Simulating...' : 'Start Simulation'}
          </button>
          <button
            onClick={completeSimulation}
            className="btn btn-secondary btn-sm"
          >
            Complete Simulation
          </button>
          <button
            onClick={simulateError}
            className="btn btn-danger btn-sm"
          >
            Simulate Error
          </button>
        </div>
      </div>

      {/* Progress and Status Display - This is where ProgressTracker appears in real usage */}
      {isSimulating && (
        <ProgressTracker
          progress={simulationProgress}
          storeConversations={mockConversations}
          selectedConversations={mockSelectedConversations}
        />
      )}

      {/* AI Comparison Results - This shows after simulation completes */}
      {simulationProgress.status === 'complete' && (
        <ComparisonResultsDisplay
          comparisonData={mockComparisonData}
          trialComparisons={mockTrialComparisons}
          currentTemplate={currentTemplate}
          model="gpt-4"
        />
      )}

      {/* Error Display */}
      {simulationProgress.status === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-lg font-medium text-red-800 mb-2">Simulation Error</h4>
          <p className="text-sm text-red-700">{simulationProgress.error}</p>
        </div>
      )}
    </div>
  );
};

export default AISimulationView;
