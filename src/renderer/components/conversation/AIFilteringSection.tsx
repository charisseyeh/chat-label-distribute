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
      const aiService = new AIService(ai.apiKey, ai.model);

      // Update progress to show analyzing status
      setAnalysisProgress(prev => ({ ...prev, status: 'analyzing' }));

      // Prepare conversation samples for AI analysis
      const conversationSamples: AIConversationSample[] = conversationsToAnalyze.map(conv => {
        // Get the best available conversation content
        let content = conv.conversationPreview;
        if (!content || content.length < 50) {
          // If preview is too short, try to get more content
          content = `Title: ${conv.title}\nMessage Count: ${conv.messageCount}\nContent: ${conv.conversationPreview || 'No detailed content available'}`;
        }
        
        return {
          title: conv.title,
          firstMessage: content,
          conversationPreview: content
        };
      });

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
        
        {/* Debug Info */}
        {ai.apiKey && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Key length: {ai.apiKey.length} characters</p>
            <p>Starts with: {ai.apiKey.substring(0, 10)}...</p>
            <p>Ends with: ...{ai.apiKey.substring(ai.apiKey.length - 10)}</p>
            <p>Contains 'sk-proj': {ai.apiKey.includes('sk-proj') ? '✅ Yes' : '❌ No'}</p>
            <p>First 20 chars: "{ai.apiKey.substring(0, 20)}"</p>
            <p>Last 20 chars: "{ai.apiKey.substring(ai.apiKey.length - 20)}"</p>
            <p>Contains spaces: {ai.apiKey.includes(' ') ? '❌ Yes' : '✅ No'}</p>
            <p>Contains newlines: {ai.apiKey.includes('\n') ? '❌ Yes' : '✅ No'}</p>
            
            {/* Reset Button for Corrupted Keys */}
            {ai.apiKey.length !== 164 && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-red-600 font-medium">⚠️ Key length mismatch detected!</p>
                <p className="text-gray-600">Expected: 164 characters, Found: {ai.apiKey.length} characters</p>
                <button
                  onClick={() => {
                    updateAISettings({ apiKey: '' });
                    setError(null);
                  }}
                  className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                >
                  Clear Corrupted Key
                </button>
              </div>
            )}
          </div>
        )}
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed min-w-[200px]"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2">
              <span>Analyzing {analysisProgress.current > 0 ? `${analysisProgress.current}/${analysisProgress.total}` : '...'}</span>
            </div>
          ) : (
            `Analyze ${getConversationsToAnalyzeCount()} Conversations`
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </>
  );
};
