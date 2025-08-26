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
  const [analysisProgress, setAnalysisProgress] = useState<{
    current: number;
    total: number;
    status: 'connecting' | 'analyzing' | 'processing' | 'complete';
  }>({ current: 0, total: 0, status: 'connecting' });
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

  const getConversationsToAnalyzeCount = () => {
    // First filter by message count (more than 8 messages)
    let count = conversations.filter(conv => conv.messageCount > 8).length;
    
    // Then apply date filtering if specified
    if (dateFilterOptions.selectedRanges.length > 0 || dateFilterOptions.useCustomRange) {
      const dateFiltered = DateFilterService.filterByDateRanges(
        conversations.filter(conv => conv.messageCount > 8),
        dateFilterOptions.selectedRanges,
        dateFilterOptions.customStartDate,
        dateFilterOptions.customEndDate,
        dateFilterOptions.useCustomRange
      );
      count = dateFiltered.length;
    }
    
    return count;
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
      // First filter by message count (more than 8 messages)
      let conversationsToAnalyze = conversations.filter(conv => conv.messageCount > 8);
      
      // Then apply date filtering if specified
      if (dateFilterOptions.selectedRanges.length > 0 || dateFilterOptions.useCustomRange) {
        conversationsToAnalyze = DateFilterService.filterByDateRanges(
          conversationsToAnalyze,
          dateFilterOptions.selectedRanges,
          dateFilterOptions.customStartDate,
          dateFilterOptions.customEndDate,
          dateFilterOptions.useCustomRange
        );
      }

      // Check if we have any conversations to analyze after filtering
      if (conversationsToAnalyze.length === 0) {
        setError('No conversations meet the filtering criteria (more than 8 messages and date range).');
        setIsAnalyzing(false);
        return;
      }

      // Update progress to show connecting status
      setAnalysisProgress({
        current: 0,
        total: conversationsToAnalyze.length,
        status: 'connecting'
      });

      // Initialize AI service
      const aiService = new AIService({
        apiKey: ai.apiKey,
        model: ai.model
      });

      // Update progress to show analyzing status
      setAnalysisProgress(prev => ({ ...prev, status: 'analyzing' }));

      // Prepare conversation samples for AI analysis
      const conversationSamples: AIConversationSample[] = conversationsToAnalyze.map(conv => ({
        title: conv.title,
        firstMessage: conv.conversationPreview || 'No message content available'
      }));

      // Analyze conversations for relevancy with progress updates
      const relevancyResults: AIRelevancyResult[] = [];
      
      for (let i = 0; i < conversationSamples.length; i++) {
        try {
          setAnalysisProgress(prev => ({ 
            ...prev, 
            current: i + 1,
            status: 'analyzing'
          }));
          
          const result = await aiService.analyzeSingleConversation(conversationSamples[i]);
          relevancyResults.push(result);
        } catch (error) {
          console.error(`Error analyzing conversation ${conversationSamples[i].title}:`, error);
          // Continue with other conversations
        }
      }

      // Update progress to show processing status
      setAnalysisProgress(prev => ({ ...prev, status: 'processing' }));
      
      // Update parent component with filtered results
      onFilteredConversations(conversationsToAnalyze);
      onRelevancyResults(relevancyResults);

      // Update progress to show complete status
      setAnalysisProgress(prev => ({ ...prev, status: 'complete' }));

      // Show success message
      setError(null);
    } catch (error) {
      console.error('AI analysis error:', error);
      setError(error instanceof Error ? error.message : 'AI analysis failed');
    } finally {
      setIsAnalyzing(false);
      // Reset progress after a short delay to show completion
      setTimeout(() => {
        setAnalysisProgress({ current: 0, total: 0, status: 'connecting' });
      }, 2000);
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
          disabled={isAnalyzing || !ai.apiKey || getConversationsToAnalyzeCount() === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : `Analyze ${getConversationsToAnalyzeCount()} Conversations`}
        </button>
      </div>

      {/* Progress and Status Display */}
      {isAnalyzing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-800">
              {analysisProgress.status === 'connecting' && '🔌 Connecting to OpenAI...'}
              {analysisProgress.status === 'analyzing' && '🤖 Analyzing conversations...'}
              {analysisProgress.status === 'processing' && '⚙️ Processing results...'}
              {analysisProgress.status === 'complete' && '✅ Analysis complete!'}
            </h4>
            <span className="text-xs text-blue-600">
              {analysisProgress.current > 0 && `${analysisProgress.current}/${analysisProgress.total}`}
            </span>
          </div>
          
          {/* Progress Bar */}
          {analysisProgress.total > 0 && (
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
              ></div>
            </div>
          )}
          
          {/* Status Messages */}
          <div className="text-xs text-blue-700 space-y-1">
            {analysisProgress.status === 'connecting' && (
              <p>Establishing connection to OpenAI API...</p>
            )}
            {analysisProgress.status === 'analyzing' && (
              <p>Analyzing conversation {analysisProgress.current} of {analysisProgress.total}...</p>
            )}
            {analysisProgress.status === 'processing' && (
              <p>Processing analysis results and updating interface...</p>
            )}
            {analysisProgress.status === 'complete' && (
              <p>Analysis completed successfully! {analysisProgress.total} conversations processed.</p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </>
  );
};
