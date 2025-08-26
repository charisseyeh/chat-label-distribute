import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useConversationStore } from '../../stores/conversationStore';
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
  const { loadedConversations, setFilteredConversations } = useConversationStore();
  
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
    
    // Reset conversations to original state (with message count filter applied)
    const resetFiltered = loadedConversations.filter(conv => conv.messageCount > 8);
    onFilteredConversations(resetFiltered);
    setFilteredConversations(resetFiltered);
    
    // Clear AI relevancy results
    onRelevancyResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter by date and find relevant topics</h3>
        <p className="text-sm text-gray-600 mt-1">Select the date range you'd like to view and/or use AI to search relevant conversations</p>
      </div>
      


      {/* Date Filtering Section */}
      <DateFilteringSection
        conversations={conversations}
        dateFilterOptions={dateFilterOptions}
        onDateFilterOptionsChange={handleDateFilterOptionsChange}
        onFilteredConversations={onFilteredConversations}
      />

      {/* AI Filtering Section */}
      <AIFilteringSection
        conversations={conversations}
        onFilteredConversations={onFilteredConversations}
        onRelevancyResults={onRelevancyResults}
        dateFilterOptions={dateFilterOptions}
      />


    </div>
  );
};
