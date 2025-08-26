import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { ConversationData } from '../../services/conversationService';
import { AIRelevancyResult } from '../../services/ai-service';
import { DateFilteringSection } from './DateFilteringSection';
import { AIFilteringSection } from './AIFilteringSection';
import { DateFilterOptions } from '../../services/dateFilterService';

interface AIFilteringPanelProps {
  conversations: ConversationData[];
  onFilteredConversations: (filteredConversations: ConversationData[]) => void;
  onRelevancyResults: (results: AIRelevancyResult[]) => void;
}

export const AIFilteringPanel: React.FC<AIFilteringPanelProps> = ({
  conversations,
  onFilteredConversations,
  onRelevancyResults
}) => {
  const { ai, updateAISettings } = useSettingsStore();
  
  // Date filtering state
  const [dateFilterOptions, setDateFilterOptions] = useState<DateFilterOptions>({
    selectedRanges: [],
    useCustomRange: false,
    customStartDate: undefined,
    customEndDate: undefined
  });

  const handleEnableAIFiltering = (enabled: boolean) => {
    updateAISettings({ enableAIFiltering: enabled });
  };

  const handleDateFilterOptionsChange = (newOptions: DateFilterOptions) => {
    setDateFilterOptions(newOptions);
  };

  const resetAllFiltering = () => {
    // Reset date filtering
    setDateFilterOptions({
      selectedRanges: [],
      useCustomRange: false,
      customStartDate: undefined,
      customEndDate: undefined
    });
    
    // Reset conversations to original state
    onFilteredConversations(conversations);
    
    // Clear AI relevancy results
    onRelevancyResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Conversation Filtering</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={ai.enableAIFiltering}
            onChange={(e) => handleEnableAIFiltering(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Enable AI filtering</span>
        </label>
      </div>

      {/* Date Filtering Section */}
      <DateFilteringSection
        conversations={conversations}
        dateFilterOptions={dateFilterOptions}
        onDateFilterOptionsChange={handleDateFilterOptionsChange}
        onFilteredConversations={onFilteredConversations}
      />

      {/* AI Filtering Section */}
      {ai.enableAIFiltering && (
        <AIFilteringSection
          conversations={conversations}
          onFilteredConversations={onFilteredConversations}
          onRelevancyResults={onRelevancyResults}
          dateFilterOptions={dateFilterOptions}
        />
      )}

      {/* Reset All Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={resetAllFiltering}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Reset All Filtering
        </button>
      </div>
    </div>
  );
};
