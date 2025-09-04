import { useCallback } from 'react';
import { useAssessmentResponseStore } from '../../stores/assessmentResponseStore';
import { AssessmentExportService } from '../../services/assessment/assessmentExportService';
import { ConversationAssessmentData } from '../../types/assessment';

export const useAssessmentExport = () => {
  const { conversationData } = useAssessmentResponseStore();

  // Export single conversation data
  const exportConversationData = useCallback(async (conversationId: string, format: 'full' | 'research' = 'full') => {
    try {
      const data = conversationData[conversationId];
      if (!data) {
        throw new Error('No data found for this conversation');
      }

      // Validate data before export
      const validation = AssessmentExportService.validateExportData(data);
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      let exportContent: string;
      let filename: string;

      if (format === 'research') {
        exportContent = AssessmentExportService.exportResearchFormat(data);
        filename = AssessmentExportService.generateFilename(conversationId, 'research');
      } else {
        exportContent = AssessmentExportService.exportConversationData(data);
        filename = AssessmentExportService.generateFilename(conversationId, 'full');
      }

      // Trigger download
      AssessmentExportService.downloadData(exportContent, filename);

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

      const exportContent = AssessmentExportService.exportAllData(conversationData);
      const filename = `all_assessment_data_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      AssessmentExportService.downloadData(exportContent, filename);

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

      const exportContent = AssessmentExportService.exportMultipleConversations(conversationData, conversationIds);
      const filename = `selected_assessment_data_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      AssessmentExportService.downloadData(exportContent, filename);

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

      const csvContent = AssessmentExportService.exportToCSV(data);
      const filename = `assessment_data_${conversationId}_${new Date().toISOString().split('T')[0]}.csv`;

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

    return AssessmentExportService.validateExportData(data);
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
