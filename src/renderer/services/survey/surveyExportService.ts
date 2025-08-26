import { ConversationSurveyData, SurveyResponse } from '../../types/survey';

export class SurveyExportService {
  /**
   * Exports survey data for a specific conversation
   */
  static exportConversationData(data: ConversationSurveyData): string {
    const exportData = {
      conversationId: data.conversationId,
      exportDate: new Date().toISOString(),
      surveyData: data,
      metadata: {
        totalResponses: data.responses.length,
        completedSections: data.completedSections,
        lastUpdated: data.lastUpdated
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exports all survey data
   */
  static exportAllData(allData: Record<string, ConversationSurveyData>): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalConversations: Object.keys(allData).length,
      conversations: allData,
      summary: {
        totalResponses: Object.values(allData).reduce((sum, data) => sum + data.responses.length, 0),
        totalCompletedSections: Object.values(allData).reduce((sum, data) => sum + data.completedSections.length, 0),
        averageResponsesPerConversation: Object.values(allData).reduce((sum, data) => sum + data.responses.length, 0) / Object.keys(allData).length
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exports survey data in research format
   */
  static exportResearchFormat(data: ConversationSurveyData): string {
    const researchData = {
      conversation_id: data.conversationId,
      export_timestamp: new Date().toISOString(),
      survey_responses: data.responses.map(response => ({
        question_id: response.questionId,
        position: response.position,
        rating: response.rating,
        timestamp: response.timestamp
      })),
      completion_status: {
        beginning: data.completedSections.includes('beginning'),
        turn6: data.completedSections.includes('turn6'),
        end: data.completedSections.includes('end')
      }
    };

    return JSON.stringify(researchData, null, 2);
  }

  /**
   * Triggers download of exported data
   */
  static downloadData(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Generates filename for export
   */
  static generateFilename(conversationId: string, format: 'full' | 'research' = 'full'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const formatSuffix = format === 'research' ? '_research' : '';
    return `survey_data_${conversationId}${formatSuffix}_${timestamp}.json`;
  }

  /**
   * Exports data for multiple conversations
   */
  static exportMultipleConversations(
    conversationsData: Record<string, ConversationSurveyData>,
    conversationIds: string[]
  ): string {
    const selectedData: Record<string, ConversationSurveyData> = {};
    
    conversationIds.forEach(id => {
      if (conversationsData[id]) {
        selectedData[id] = conversationsData[id];
      }
    });

    return this.exportAllData(selectedData);
  }

  /**
   * Exports data in CSV format (alternative to JSON)
   */
  static exportToCSV(data: ConversationSurveyData): string {
    const headers = ['Conversation ID', 'Position', 'Question ID', 'Rating', 'Timestamp'];
    const rows = data.responses.map(response => [
      data.conversationId,
      response.position,
      response.questionId,
      response.rating,
      response.timestamp
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Validates export data before download
   */
  static validateExportData(data: ConversationSurveyData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.conversationId) {
      errors.push('Missing conversation ID');
    }

    if (!data.responses || data.responses.length === 0) {
      errors.push('No survey responses found');
    }

    if (!data.lastUpdated) {
      errors.push('Missing last updated timestamp');
    }

    // Validate each response
    data.responses.forEach((response, index) => {
      if (!response.questionId) {
        errors.push(`Response ${index + 1}: Missing question ID`);
      }
      if (!response.position) {
        errors.push(`Response ${index + 1}: Missing position`);
      }
      if (response.rating === undefined || response.rating === null) {
        errors.push(`Response ${index + 1}: Missing rating`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
