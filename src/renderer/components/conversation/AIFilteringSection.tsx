import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { AIService, AIConversationSample, AIRelevancyResult } from '../../services/ai-service';
import { ConversationData } from '../../services/conversationService';
import { DateFilterService } from '../../services/dateFilterService';

interface AIFilteringSectionProps {
  conversations: ConversationData[];
  onFilteredConversations: (filteredConversations: ConversationData[]) => void;
  onRelevancyResults: (results: AIRelevancyResult[]) => void;
  dateFilterOptions: {
    selectedRanges: string[];
    customStartDate?: Date;
    customEndDate?: Date;
    useCustomRange: boolean;
  };
}

export const AIFilteringSection: React.FC<AIFilteringSectionProps> = ({
  conversations,
  onFilteredConversations,
  onRelevancyResults,
  dateFilterOptions
}) => {
  const { ai, updateAISettings } = useSettingsStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!ai.apiKey);

  const handleApiKeyChange = (apiKey: string) => {
    updateAISettings({ apiKey });
    setError(null);
  };

  const handleModelChange = (model: string) => {
    updateAISettings({ model });
  };

  const handleEnableAIFiltering = (enabled: boolean) => {
    updateAISettings({ enableAIFiltering: enabled });
  };

  const analyzeConversations = async () => {
    if (!ai.apiKey) {
      setError('Please enter your OpenAI API key first.');
      return;
    }

    if (conversations.length === 0) {
      setError('No conversations to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const aiService = new AIService({
        apiKey: ai.apiKey,
        model: ai.model
      });

      // Apply date filtering first
      let conversationsToAnalyze = conversations;
      if (dateFilterOptions.selectedRanges.length > 0 || dateFilterOptions.useCustomRange) {
        conversationsToAnalyze = DateFilterService.filterByDateRanges(
          conversations,
          dateFilterOptions.selectedRanges,
          dateFilterOptions.customStartDate,
          dateFilterOptions.customEndDate,
          dateFilterOptions.useCustomRange
        );
      }

      // Prepare conversation samples for AI analysis
      const conversationSamples: AIConversationSample[] = conversationsToAnalyze.map(conv => ({
        title: conv.title,
        firstMessage: conv.firstMessage || 'No message content available'
      }));

      // Analyze conversations for relevancy
      const relevancyResults = await aiService.analyzeConversationRelevancy(conversationSamples);
      
      // Update parent component with filtered results
      onFilteredConversations(conversationsToAnalyze);
      onRelevancyResults(relevancyResults);

      // Show success message
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!ai.enableAIFiltering) {
    return null;
  }

  return (
    <>
      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI API Key
        </label>
        <div className="flex gap-2">
          <input
            type={showApiKeyInput ? 'text' : 'password'}
            value={ai.apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showApiKeyInput ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your API key is stored locally and never sent to our servers
        </p>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          value={ai.model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
          <option value="gpt-4">GPT-4 (More Accurate)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          GPT-3.5 Turbo is recommended for cost-effectiveness
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={analyzeConversations}
          disabled={isAnalyzing || !ai.apiKey || conversations.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : `Analyze ${conversations.length} Conversations`}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>How it works:</strong> The AI will analyze your conversations and identify those 
          relevant for reflective or therapy-like discussions. It looks for topics like personal growth, 
          emotions, relationships, self-reflection, and mental health. Date filtering can be used alone 
          or combined with AI analysis.
        </p>
      </div>
    </>
  );
};
