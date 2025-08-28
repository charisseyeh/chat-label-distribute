import React from 'react';
import type { ConversationData } from '../../../services/conversation';
import { DateFilterService, DateRange, DateFilterOptions } from '../../../services/core/dateFilterService';
import { useConversationStore } from '../../../stores/conversationStore';
import { FloatingLabelInput, FloatingLabelSelect } from '../../common';

interface DateFilteringSectionProps {
  conversations: ConversationData[];
  dateFilterOptions: DateFilterOptions;
  onDateFilterOptionsChange: (options: DateFilterOptions) => void;
  onFilteredConversations: (filteredConversations: ConversationData[]) => void;
}

export const DateFilteringSection: React.FC<DateFilteringSectionProps> = ({
  conversations,
  dateFilterOptions,
  onDateFilterOptionsChange,
  onFilteredConversations
}) => {
  const { loadedConversations, setFilteredConversations } = useConversationStore();
  const dateRanges = DateFilterService.getDateRanges();

  // Use loadedConversations for filtering (original data) instead of already filtered conversations
  const originalConversations = loadedConversations.length > 0 ? loadedConversations : conversations;

  // Handle model era selection from dropdown
  const handleModelEraChange = (selectedEra: string) => {
    
    if (selectedEra === '') {
      // No era selected, clear custom dates and reset to original conversations
      const newOptions = {
        ...dateFilterOptions,
        customStartDate: undefined,
        customEndDate: undefined
      };
      onDateFilterOptionsChange(newOptions);
      // Reset to original conversations (with message count filter applied)
      const resetFiltered = originalConversations.filter(conv => conv.messageCount > 8);
      onFilteredConversations(resetFiltered);
      setFilteredConversations(resetFiltered);
      return;
    }

    // Find the selected era and prefill custom dates
    const selectedRange = dateRanges.find(range => range.label === selectedEra);
    if (selectedRange) {
      const newOptions = {
        ...dateFilterOptions,
        customStartDate: selectedRange.startDate,
        customEndDate: selectedRange.endDate
      };
      onDateFilterOptionsChange(newOptions);
      
      // Apply the filter immediately when era is selected
      const filteredConversations = DateFilterService.filterByDateRanges(
        originalConversations,
        [], // No predefined ranges used
        selectedRange.startDate,
        selectedRange.endDate,
        true // Always use custom range
      );
      
      // Apply message count filter to date-filtered results
      const finalFiltered = filteredConversations.filter(conv => conv.messageCount > 8);
      
      onFilteredConversations(finalFiltered);
      setFilteredConversations(finalFiltered);
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    try {
      const date = value ? new Date(value + 'T00:00:00') : undefined;
      
      // Validate the date
      if (date && isNaN(date.getTime())) {
        console.error('Invalid date:', value);
        return;
      }
      
      const newOptions = {
        ...dateFilterOptions,
        [field === 'start' ? 'customStartDate' : 'customEndDate']: date
      };
      
      onDateFilterOptionsChange(newOptions);
      
      // Auto-apply filtering immediately when either date changes
      if (newOptions.customStartDate || newOptions.customEndDate) {
        applyDateFiltering(newOptions);
      }
    } catch (error) {
      console.error('Error handling date change:', error);
    }
  };

  // Apply date filtering
  const applyDateFiltering = (options = dateFilterOptions) => {
    // Apply filtering even with partial date ranges
    if (!options.customStartDate && !options.customEndDate) {
      return; // Don't apply if no dates are set at all
    }

    try {
      console.log('🔍 Applying date filter with options:', options);
      console.log('🔍 Original conversations count:', originalConversations.length);
      console.log('🔍 Sample conversation data:', originalConversations[0]);
      
      const filteredConversations = DateFilterService.filterByDateRanges(
        originalConversations,
        [], // No predefined ranges used
        options.customStartDate,
        options.customEndDate,
        true // Always use custom range
      );
      
      console.log('🔍 Date-filtered conversations count:', filteredConversations.length);
      
      // Apply message count filter to date-filtered results
      const finalFiltered = filteredConversations.filter(conv => conv.messageCount > 8);
      
      console.log('🔍 Final filtered conversations count:', finalFiltered.length);
      
      onFilteredConversations(finalFiltered);
      setFilteredConversations(finalFiltered);
    } catch (error) {
      console.error('Error applying date filter:', error);
    }
  };

  // Reset date filtering
  const resetDateFiltering = () => {
    const newOptions = {
      selectedRanges: [],
      useCustomRange: false,
      customStartDate: undefined,
      customEndDate: undefined
    };
    onDateFilterOptionsChange(newOptions);
    // Reset to original conversations (with message count filter applied)
    const resetFiltered = originalConversations.filter(conv => conv.messageCount > 8);
    onFilteredConversations(resetFiltered);
    setFilteredConversations(resetFiltered);
  };

  // Get the currently selected era based on custom dates
  const getSelectedEra = (): string => {
    if (!dateFilterOptions.customStartDate || !dateFilterOptions.customEndDate) {
      return '';
    }
    
    for (const range of dateRanges) {
      if (dateFilterOptions.customStartDate.getTime() === range.startDate.getTime() &&
          dateFilterOptions.customEndDate.getTime() === range.endDate.getTime()) {
        return range.label;
      }
    }
    return '';
  };

  return (
    <div>
      {/* Model Era Dropdown */}
      <div className="mb-4">
        <FloatingLabelSelect
          label="Model Era"
          value={getSelectedEra()}
          onChange={handleModelEraChange}
          options={[
            { value: "", label: "Select a model date range" },
            ...dateRanges.map((range) => ({
              value: range.label,
              label: `${range.label} (${DateFilterService.formatDateRange(range)})`
            }))
          ]}
        />
      </div>



      {/* Custom Date Range - Always Visible */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FloatingLabelInput
              label="Start Date"
              value={dateFilterOptions.customStartDate?.toISOString().split('T')[0] || ''}
              onChange={(value) => handleCustomDateChange('start', value)}
              type="date"
            />
          </div>
          <div>
            <FloatingLabelInput
              label="End Date"
              value={dateFilterOptions.customEndDate?.toISOString().split('T')[0] || ''}
              onChange={(value) => handleCustomDateChange('end', value)}
              type="date"
            />
          </div>
        </div>
        

      </div>




    </div>
  );
};
