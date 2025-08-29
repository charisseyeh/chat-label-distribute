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
        label: 'GPT-3.5 Era',
        startDate: new Date('2022-11-30'),
        endDate: new Date('2023-03-13'),
        description: 'Conversations during GPT-3.5 availability'
      },
      {
        label: 'GPT-3.5 Turbo Era',
        startDate: new Date('2023-03-14'),
        endDate: new Date('2023-06-12'),
        description: 'Conversations during GPT-3.5 Turbo availability'
      },
      {
        label: 'GPT-4 Era',
        startDate: new Date('2023-03-14'),
        endDate: new Date('2023-11-05'),
        description: 'Conversations during GPT-4 availability'
      },
      {
        label: 'GPT-3.5 Turbo 16K Era',
        startDate: new Date('2023-06-13'),
        endDate: new Date('2023-11-05'),
        description: 'Conversations during GPT-3.5 Turbo 16K availability'
      },
      {
        label: 'GPT-4 Turbo Era',
        startDate: new Date('2023-11-06'),
        endDate: new Date('2024-04-08'),
        description: 'Conversations during GPT-4 Turbo availability'
      },
      {
        label: 'GPT-4 Turbo 2024-04-09 Era',
        startDate: new Date('2024-04-09'),
        endDate: new Date('2024-05-12'),
        description: 'Conversations during GPT-4 Turbo (2024-04-09) availability'
      },
      {
        label: 'GPT-4o Era',
        startDate: new Date('2024-05-13'),
        endDate: new Date('2024-07-19'),
        description: 'Conversations during GPT-4o availability'
      },
      {
        label: 'GPT-4o Mini Era',
        startDate: new Date('2024-07-20'),
        endDate: new Date('2024-09-30'),
        description: 'Conversations during GPT-4o Mini availability'
      },
      {
        label: 'GPT-4o 2024-10-01 Era',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        description: 'Conversations during GPT-4o (2024-10-01) availability'
      },
      {
        label: 'GPT-5 Era',
        startDate: new Date('2025-01-01'),
        endDate: now,
        description: 'Conversations during GPT-5 availability'
      }
    ];
  }

  // Helper method to extract date from conversation
  private static extractConversationDate(conv: any): Date | null {
    // Try different date fields in order of preference
    if (conv.createTime && typeof conv.createTime === 'number') {
      // Unix timestamp (seconds)
      return new Date(conv.createTime * 1000);
    }
    
    if (conv.createTime && typeof conv.createTime === 'string') {
      // ISO string or other date string
      const date = new Date(conv.createTime);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    if (conv.createdAt && typeof conv.createdAt === 'string') {
      // ISO string
      const date = new Date(conv.createdAt);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    if (conv.createdAt && typeof conv.createdAt === 'number') {
      // Unix timestamp (seconds)
      return new Date(conv.createdAt * 1000);
    }
    
    // If no valid date found, return null
    return null;
  }

  // Filter conversations by date ranges
  static filterByDateRanges(
    conversations: any[],
    selectedRanges: string[],
    customStartDate?: Date,
    customEndDate?: Date,
    useCustomRange: boolean = false
  ): any[] {
    if (useCustomRange && (customStartDate || customEndDate)) {
      const filtered = conversations.filter(conv => {
        const convDate = this.extractConversationDate(conv);
        if (!convDate) {
          return false; // Skip conversations without valid dates
        }
        
        // Handle partial date ranges
        let isInRange = true;
        if (customStartDate && convDate < customStartDate) {
          isInRange = false;
        }
        if (customEndDate && convDate > customEndDate) {
          isInRange = false;
        }
        
        return isInRange;
      });
      return filtered;
    }

    if (selectedRanges.length === 0) {
      return conversations;
    }

    const ranges = this.getDateRanges();
    const selectedRangesData = ranges.filter(range => selectedRanges.includes(range.label));

    return conversations.filter(conv => {
      const convDate = this.extractConversationDate(conv);
      if (!convDate) return false; // Skip conversations without valid dates
      
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
      const convDate = this.extractConversationDate(conv);
      if (!convDate) return false; // Skip conversations without valid dates
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
