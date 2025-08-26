export interface DateRange {
  label: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface DateFilterOptions {
  selectedRanges: string[];
  customStartDate?: Date;
  customEndDate?: Date;
  useCustomRange: boolean;
}

export class DateFilterService {
  // GPT model release dates
  private static readonly GPT_MODEL_DATES = {
    'gpt-3': new Date('2020-06-01'),
    'gpt-3.5': new Date('2022-11-01'),
    'gpt-4': new Date('2023-03-01'),
    'gpt-4-turbo': new Date('2023-11-01'),
    'gpt-4o': new Date('2024-05-01')
  };

  // Predefined date ranges based on GPT model releases
  static getDateRanges(): DateRange[] {
    const now = new Date();
    
    return [
      {
        label: 'Pre-GPT Era',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2020-05-31'),
        description: 'Conversations before GPT-3 was released'
      },
      {
        label: 'GPT-3 Era',
        startDate: new Date('2020-06-01'),
        endDate: new Date('2022-10-31'),
        description: 'Conversations during GPT-3 availability'
      },
      {
        label: 'GPT-3.5 Era',
        startDate: new Date('2022-11-01'),
        endDate: new Date('2023-02-28'),
        description: 'Conversations during GPT-3.5 availability'
      },
      {
        label: 'GPT-4 Era',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-10-31'),
        description: 'Conversations during GPT-4 availability'
      },
      {
        label: 'GPT-4 Turbo Era',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-04-30'),
        description: 'Conversations during GPT-4 Turbo availability'
      },
      {
        label: 'GPT-4o Era',
        startDate: new Date('2024-05-01'),
        endDate: now,
        description: 'Conversations during GPT-4o availability'
      }
    ];
  }

  // Filter conversations by date ranges
  static filterByDateRanges(
    conversations: any[],
    selectedRanges: string[],
    customStartDate?: Date,
    customEndDate?: Date,
    useCustomRange: boolean = false
  ): any[] {
    if (useCustomRange && customStartDate && customEndDate) {
      return conversations.filter(conv => {
        const convDate = new Date(conv.createTime * 1000);
        return convDate >= customStartDate && convDate <= customEndDate;
      });
    }

    if (selectedRanges.length === 0) {
      return conversations;
    }

    const ranges = this.getDateRanges();
    const selectedRangesData = ranges.filter(range => selectedRanges.includes(range.label));

    return conversations.filter(conv => {
      const convDate = new Date(conv.createTime * 1000);
      
      return selectedRangesData.some(range => 
        convDate >= range.startDate && convDate <= range.endDate
      );
    });
  }

  // Get conversations by specific GPT model era
  static filterByModelEra(conversations: any[], modelEra: string): any[] {
    const ranges = this.getDateRanges();
    const targetRange = ranges.find(range => range.label === modelEra);
    
    if (!targetRange) {
      return conversations;
    }

    return conversations.filter(conv => {
      const convDate = new Date(conv.createTime * 1000);
      return convDate >= targetRange.startDate && convDate <= targetRange.endDate;
    });
  }

  // Get the GPT model era for a specific date
  static getModelEraForDate(date: Date): string {
    const ranges = this.getDateRanges();
    
    for (const range of ranges) {
      if (date >= range.startDate && date <= range.endDate) {
        return range.label;
      }
    }
    
    return 'Unknown Era';
  }

  // Format date for display
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date range for display
  static formatDateRange(range: DateRange): string {
    return `${this.formatDate(range.startDate)} - ${this.formatDate(range.endDate)}`;
  }
}
