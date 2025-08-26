# Date Filtering Feature

## Overview
The date filtering feature allows users to filter conversations based on GPT model release dates and custom date ranges. This is integrated with the existing AI filtering panel to provide comprehensive conversation filtering capabilities.

## GPT Model Release Dates

The system includes predefined date ranges based on major GPT model releases:

1. **Pre-GPT Era** (Jan 2015 - May 2020)
   - Conversations before GPT-3 was released
   - Useful for identifying pre-AI conversation patterns

2. **GPT-3 Era** (Jun 2020 - Oct 2022)
   - Conversations during GPT-3 availability
   - Covers the early AI conversation period

3. **GPT-3.5 Era** (Nov 2022 - Feb 2023)
   - Conversations during GPT-3.5 availability
   - Represents the transition to more capable models

4. **GPT-4 Era** (Mar 2023 - Oct 2023)
   - Conversations during GPT-4 availability
   - Higher quality AI interactions

5. **GPT-4 Turbo Era** (Nov 2023 - Apr 2024)
   - Conversations during GPT-4 Turbo availability
   - Enhanced performance and capabilities

6. **GPT-4o Era** (May 2024 - Present)
   - Current era with the latest model
   - Most recent conversations

## Features

### Predefined Date Ranges
- Checkbox selection for multiple GPT model eras
- Automatic date range calculation
- Visual display of date ranges with descriptions

### Custom Date Range
- Option to specify custom start and end dates
- Date picker inputs for precise control
- Mutually exclusive with predefined ranges

### Integration with AI Filtering
- Date filtering can be applied before AI analysis
- Reduces the number of conversations sent to AI
- Improves cost efficiency and analysis speed

## Usage

### Basic Date Filtering
1. Select one or more GPT model eras using checkboxes
2. Click "Apply Date Filter" to see filtered results
3. Use "Reset Date Filter" to clear selections

### Custom Date Range
1. Check "Custom Date Range"
2. Select start and end dates
3. Click "Apply Date Filter"

### Combined with AI Analysis
1. Apply date filtering first
2. Enable AI filtering
3. Run AI analysis on the date-filtered subset

## Technical Implementation

### Files Created/Modified
- `src/renderer/services/dateFilterService.ts` - New service for date filtering logic
- `src/renderer/components/conversation/AIFilteringPanel.tsx` - Enhanced with date filtering UI

### Key Functions
- `DateFilterService.getDateRanges()` - Returns predefined GPT era date ranges
- `DateFilterService.filterByDateRanges()` - Filters conversations by selected ranges
- `DateFilterService.getModelEraForDate()` - Identifies which era a date belongs to

### State Management
- Date filter options stored in component state
- Integration with existing conversation filtering system
- Proper cleanup and reset functionality

## Benefits

1. **Historical Analysis**: Study conversation patterns across different AI model eras
2. **Cost Efficiency**: Filter conversations before AI analysis to reduce API calls
3. **Research Value**: Compare conversation quality and topics across different time periods
4. **User Control**: Flexible filtering options for different research needs

## Future Enhancements

- Export filtered conversations by date range
- Statistical analysis of conversation patterns by era
- Integration with conversation metadata for more precise filtering
- Batch processing of conversations within specific date ranges
