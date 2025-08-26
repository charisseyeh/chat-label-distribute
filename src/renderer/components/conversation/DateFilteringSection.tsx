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

  // Date filtering handlers
  const handleDateRangeToggle = (rangeLabel: string) => {
    const newOptions = {
      ...dateFilterOptions,
      selectedRanges: dateFilterOptions.selectedRanges.includes(rangeLabel)
        ? dateFilterOptions.selectedRanges.filter(r => r !== rangeLabel)
        : [...dateFilterOptions.selectedRanges, rangeLabel]
    };
    onDateFilterOptionsChange(newOptions);
  };

  const handleCustomRangeToggle = (useCustom: boolean) => {
    const newOptions = {
      ...dateFilterOptions,
      useCustomRange: useCustom,
      selectedRanges: useCustom ? [] : dateFilterOptions.selectedRanges
    };
    onDateFilterOptionsChange(newOptions);
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
    const filteredConversations = DateFilterService.filterByDateRanges(
      conversations,
      dateFilterOptions.selectedRanges,
      dateFilterOptions.customStartDate,
      dateFilterOptions.customEndDate,
      dateFilterOptions.useCustomRange
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

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-md font-medium text-gray-900 mb-3">Date Filtering</h4>
      
      {/* Predefined Date Ranges */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by GPT Model Era
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dateRanges.map((range) => (
            <label key={range.label} className="flex items-center">
              <input
                type="checkbox"
                checked={dateFilterOptions.selectedRanges.includes(range.label)}
                onChange={() => handleDateRangeToggle(range.label)}
                disabled={dateFilterOptions.useCustomRange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="text-sm">
                <div className="font-medium text-gray-700">{range.label}</div>
                <div className="text-xs text-gray-500">{DateFilterService.formatDateRange(range)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="mb-4">
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={dateFilterOptions.useCustomRange}
            onChange={(e) => handleCustomRangeToggle(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Custom Date Range</span>
        </label>
        
        {dateFilterOptions.useCustomRange && (
          <div className="grid grid-cols-2 gap-3 ml-6">
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
        )}
      </div>

      {/* Date Filter Actions */}
      <div className="flex gap-2">
        <button
          onClick={applyDateFiltering}
          disabled={dateFilterOptions.selectedRanges.length === 0 && !dateFilterOptions.useCustomRange}
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
