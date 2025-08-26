import { useCallback } from 'react';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { SurveyExportService } from '../services/survey/surveyExportService';
import { ConversationSurveyData } from '../types/survey';

export const useSurveyExport = () => {
  const { conversationData } = useSurveyResponseStore();

  // Export single conversation data
  const exportConversationData = useCallback(async (conversationId: string, format: 'full' | 'research' = 'full') => {
    try {
      const data = conversationData[conversationId];
      if (!data) {
        throw new Error('No data found for this conversation');
      }

      // Validate data before export
      const validation = SurveyExportService.validateExportData(data);
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      let exportContent: string;
      let filename: string;

      if (format === 'research') {
        exportContent = SurveyExportService.exportResearchFormat(data);
        filename = SurveyExportService.generateFilename(conversationId, 'research');
      } else {
        exportContent = SurveyExportService.exportConversationData(data);
        filename = SurveyExportService.generateFilename(conversationId, 'full');
      }

      // Trigger download
      SurveyExportService.downloadData(exportContent, filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [conversationData]);

  // Export all conversation data
  const exportAllData = useCallback(async () => {
    try {
      if (Object.keys(conversationData).length === 0) {
        throw new Error('No conversation data found');
      }

      const exportContent = SurveyExportService.exportAllData(conversationData);
      const filename = `all_survey_data_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      SurveyExportService.downloadData(exportContent, filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Export all failed:', error);
      throw error;
    }
  }, [conversationData]);

  // Export multiple selected conversations
  const exportMultipleConversations = useCallback(async (conversationIds: string[]) => {
    try {
      if (conversationIds.length === 0) {
        throw new Error('No conversations selected for export');
      }

      const exportContent = SurveyExportService.exportMultipleConversations(conversationData, conversationIds);
      const filename = `selected_survey_data_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      SurveyExportService.downloadData(exportContent, filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Export multiple failed:', error);
      throw error;
    }
  }, [conversationData]);

  // Export to CSV format
  const exportToCSV = useCallback(async (conversationId: string) => {
    try {
      const data = conversationData[conversationId];
      if (!data) {
        throw new Error('No data found for this conversation');
      }

      const csvContent = SurveyExportService.exportToCSV(data);
      const filename = `survey_data_${conversationId}_${new Date().toISOString().split('T')[0]}.csv`;

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    }
  }, [conversationData]);

  // Get export statistics
  const getExportStats = useCallback(() => {
    const conversationIds = Object.keys(conversationData);
    const totalConversations = conversationIds.length;
    
    if (totalConversations === 0) {
      return {
        totalConversations: 0,
        totalResponses: 0,
        totalCompletedSections: 0,
        averageResponsesPerConversation: 0
      };
    }

    const totalResponses = Object.values(conversationData).reduce((sum, data) => sum + data.responses.length, 0);
    const totalCompletedSections = Object.values(conversationData).reduce((sum, data) => sum + data.completedSections.length, 0);
    const averageResponsesPerConversation = totalResponses / totalConversations;

    return {
      totalConversations,
      totalResponses,
      totalCompletedSections,
      averageResponsesPerConversation: Math.round(averageResponsesPerConversation * 100) / 100
    };
  }, [conversationData]);

  // Validate export data
  const validateExportData = useCallback((conversationId: string) => {
    const data = conversationData[conversationId];
    if (!data) {
      return { isValid: false, errors: ['No data found for this conversation'] };
    }

    return SurveyExportService.validateExportData(data);
  }, [conversationData]);

  // Check if conversation has exportable data
  const hasExportableData = useCallback((conversationId: string) => {
    const data = conversationData[conversationId];
    return data && data.responses.length > 0;
  }, [conversationData]);

  return {
    // Export functions
    exportConversationData,
    exportAllData,
    exportMultipleConversations,
    exportToCSV,
    
    // Utility functions
    getExportStats,
    validateExportData,
    hasExportableData,
    
    // Available data
    availableConversations: Object.keys(conversationData)
  };
};
