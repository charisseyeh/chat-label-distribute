import React, { useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { AIService, AIConversationSample, AIRelevancyResult } from '../../../services/ai/ai-service';
import { ConversationData } from '../../../services/conversation/conversationService';
import { DateFilterService } from '../../../services/core/dateFilterService';
import { FloatingLabelInput, FloatingLabelSelect } from '../../common';

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
        
        // If preview is too short or doesn't exist, create a more informative fallback
        if (!content || content.length < 100) {
          const fallbackContent = [
            `Title: ${conv.title}`,
            `Message Count: ${conv.messageCount}`,
            `Model: ${conv.modelVersion || 'Unknown'}`,
            `Created: ${conv.createdAt || 'Unknown'}`,
            `Content: ${content || 'No conversation preview available'}`,
            `Note: This conversation may have limited content for analysis. Consider reviewing manually.`
          ].join('\n');
          
          content = fallbackContent;
        }
        
        // Debug logging to see what content we're sending
        
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



  return (
    <>
              {/* API Key Input */}
        <div className="mb-4">
          <FloatingLabelInput
            label="OpenAI API Key"
            value={ai.apiKey}
            onChange={handleApiKeyChange}
            type="password"
            placeholder="sk-..."
            showToggleButton={true}
            onToggleVisibility={() => setShowApiKeyInput(!showApiKeyInput)}
            isVisible={showApiKeyInput}
          />

        </div>

      

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={analyzeConversations}
          disabled={isAnalyzing || !ai.apiKey || getConversationsToAnalyzeCount() === 0}
          className="btn-primary btn-md min-w-[200px]"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2">
              <span>Analyzing {analysisProgress.current > 0 ? `${analysisProgress.current}/${analysisProgress.total}` : '...'}</span>
            </div>
          ) : (
            'Find relevant conversations with AI'
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
