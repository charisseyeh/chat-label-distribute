import React, { useState } from 'react';
import { useConversationStore } from '../../../stores/conversationStore';
import type { ConversationData } from '../../../services/conversation';
import { AIRelevancyResult } from '../../../services/ai/ai-service';
import { useNavigationStore } from '../../../stores/navigationStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { DateFilterOptions } from '../../../services/core/dateFilterService';
import { DateFilteringSection } from './DateFilteringSection';
import { AIFilteringSection } from './AIFilteringSection';

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
  const { loadedConversations, setFilteredConversations } = useConversationStore();
  
  // Date filtering state
  const [dateFilterOptions, setDateFilterOptions] = useState<DateFilterOptions>({
    selectedRanges: [],
    useCustomRange: false,
    customStartDate: undefined,
    customEndDate: undefined
  });

  const handleDateFilterOptionsChange = (newOptions: DateFilterOptions) => {
    setDateFilterOptions(newOptions);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <div className="mb-4">
        <h2 className="text-h3">Filter by date and find relevant topics</h2>
        <p className="text-body-secondary mt-1">Select the date range you'd like to view and/or use AI to search relevant conversations</p>
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
