import React from 'react';
import { ConversationData } from '../../services/conversationService';
import { DateFilterService, DateRange, DateFilterOptions } from '../../services/dateFilterService';

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
  const dateRanges = DateFilterService.getDateRanges();

  // Handle model era selection from dropdown
  const handleModelEraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEra = event.target.value;
    
    if (selectedEra === '') {
      // No era selected, clear custom dates
      const newOptions = {
        ...dateFilterOptions,
        customStartDate: undefined,
        customEndDate: undefined
      };
      onDateFilterOptionsChange(newOptions);
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
    }
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : undefined;
    const newOptions = {
      ...dateFilterOptions,
      [field === 'start' ? 'customStartDate' : 'customEndDate']: date
    };
    onDateFilterOptionsChange(newOptions);
  };

  // Apply date filtering
  const applyDateFiltering = () => {
    if (!dateFilterOptions.customStartDate || !dateFilterOptions.customEndDate) {
      return; // Don't apply if dates aren't set
    }

    const filteredConversations = DateFilterService.filterByDateRanges(
      conversations,
      [], // No predefined ranges used
      dateFilterOptions.customStartDate,
      dateFilterOptions.customEndDate,
      true // Always use custom range
    );
    
    onFilteredConversations(filteredConversations);
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
    onFilteredConversations(conversations);
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
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-md font-medium text-gray-900 mb-3">Date Filtering</h4>
      
      {/* Model Era Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select GPT Model Era
        </label>
        <select
          value={getSelectedEra()}
          onChange={handleModelEraChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Select a model era --</option>
          {dateRanges.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label} ({DateFilterService.formatDateRange(range)})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Select a model era to automatically set the date range, or manually adjust the dates below
        </p>
      </div>

      {/* Custom Date Range - Always Visible */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={dateFilterOptions.customStartDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={dateFilterOptions.customEndDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Date Filter Actions */}
      <div className="flex gap-2">
        <button
          onClick={applyDateFiltering}
          disabled={!dateFilterOptions.customStartDate || !dateFilterOptions.customEndDate}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
        >
          Apply Date Filter
        </button>
        
        <button
          onClick={resetDateFiltering}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-3 rounded-md transition-colors"
        >
          Reset Date Filter
        </button>
      </div>
    </div>
  );
};
