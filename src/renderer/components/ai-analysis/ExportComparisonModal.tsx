import React, { useState, useMemo } from 'react';
import { List } from '../common/molecules/list';
import { SurveyTemplate } from '../../types/survey';

interface ComparisonData {
  conversationId: string;
  conversationTitle: string;
  humanResponses: Record<string, number>;
  aiResponses: Record<string, number>;
  agreement: number;
  differences: Array<{
    questionId: string;
    questionText: string;
    humanRating: number;
    aiRating: number;
    difference: number;
  }>;
}

interface TrialComparison {
  trialNumber: number;
  humanRatings: Record<string, number>;
  aiRatings: Record<string, number>;
}

interface ExportComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonData: ComparisonData[];
  trialComparisons: TrialComparison[];
  currentTemplate: SurveyTemplate | null;
  model: string;
  accuracy: number;
}

const ExportComparisonModal: React.FC<ExportComparisonModalProps> = ({
  isOpen,
  onClose,
  comparisonData,
  trialComparisons,
  currentTemplate,
  model,
  accuracy
}) => {
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);

  // Calculate accuracy for each conversation
  const conversationsWithAccuracy = useMemo(() => {
    return comparisonData.map(comparison => ({
      id: comparison.conversationId,
      title: comparison.conversationTitle,
      accuracy: Math.round(comparison.agreement * 100)
    }));
  }, [comparisonData]);

  const handleConversationToggle = (conversationId: string) => {
    setSelectedConversationIds(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedConversationIds(conversationsWithAccuracy.map(conv => conv.id));
  };

  const handleDeselectAll = () => {
    setSelectedConversationIds([]);
  };

  const handleExport = () => {
    if (selectedConversationIds.length === 0) {
      alert('Please select at least one conversation to export.');
      return;
    }

    // Filter comparison data to only include selected conversations
    const selectedComparisonData = comparisonData.filter(comparison => 
      selectedConversationIds.includes(comparison.conversationId)
    );

    // Normalize template to use numerical question IDs
    const normalizedTemplate = currentTemplate ? {
      ...currentTemplate,
      questions: currentTemplate.questions.map((question, index) => ({
        ...question,
        id: (index + 1).toString() // Convert to numerical ID
      }))
    } : null;

    // Normalize comparison data to use numerical question IDs
    const normalizedComparisonData = selectedComparisonData.map(comparison => {
      const normalizedHumanResponses: Record<string, number> = {};
      const normalizedAiResponses: Record<string, number> = {};
      
      // Create a mapping from old IDs to new numerical IDs
      const questionIdMap: Record<string, string> = {};
      if (currentTemplate) {
        currentTemplate.questions.forEach((question, index) => {
          questionIdMap[question.id] = (index + 1).toString();
        });
      }

      // Normalize human responses
      Object.entries(comparison.humanResponses).forEach(([key, value]) => {
        const [position, questionId] = key.split('_');
        const normalizedQuestionId = questionIdMap[questionId] || questionId;
        normalizedHumanResponses[`${position}_${normalizedQuestionId}`] = value;
      });

      // Normalize AI responses
      Object.entries(comparison.aiResponses).forEach(([key, value]) => {
        const [position, questionId] = key.split('_');
        const normalizedQuestionId = questionIdMap[questionId] || questionId;
        normalizedAiResponses[`${position}_${normalizedQuestionId}`] = value;
      });

      return {
        ...comparison,
        humanResponses: normalizedHumanResponses,
        aiResponses: normalizedAiResponses,
        differences: comparison.differences.map(diff => ({
          ...diff,
          questionId: questionIdMap[diff.questionId] || diff.questionId
        }))
      };
    });

    // Create export data
    const exportData = {
      timestamp: new Date().toISOString(),
      template: normalizedTemplate,
      model: model,
      accuracy: accuracy,
      comparisons: normalizedComparisonData,
      trials: trialComparisons,
      exportInfo: {
        totalConversations: selectedComparisonData.length,
        totalQuestions: currentTemplate?.questions.length || 0,
        totalPositions: 3, // beginning, turn6, end
        totalTrials: trialComparisons.length
      }
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-comparison-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Close modal after export
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Export comparison results for your own use
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-6">
            <List
              variant="with-dividers"
              listItemVariant="check-single"
              items={conversationsWithAccuracy.map(conversation => ({
                title: conversation.title,
                metadata: `${conversation.accuracy}% AI accuracy`,
                checked: selectedConversationIds.includes(conversation.id),
                onCheckChange: () => handleConversationToggle(conversation.id)
              }))}
            />
          </div>

          {/* Selection Controls */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">
                {selectedConversationIds.length}/{conversationsWithAccuracy.length} selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Deselect all
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start space-x-2 mb-6">
              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-600">
                Your private data is safe. Details of your conversation will not be exported or shared. Only numerical labels and assessment criteria will be exported.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                disabled={selectedConversationIds.length === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Export {selectedConversationIds.length > 0 ? `(${selectedConversationIds.length}) ` : ''}comparison results
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Share for research
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportComparisonModal;
