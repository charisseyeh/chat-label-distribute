import { useCallback, useMemo } from 'react';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { SurveyResponse, ConversationSurveyData, SurveyProgress } from '../types/survey';

export const useSurveyResponses = (conversationId?: string) => {
  const {
    responses,
    conversationData,
    loading,
    error,
    setLoading,
    setError,
    clearError,
    addResponse,
    updateResponse,
    removeResponse,
    getResponsesForConversation,
    getResponsesForPosition,
    getConversationData,
    updateConversationData,
    markSectionCompleted,
    getProgress,
    getOverallProgress,
    clearConversationData,
    exportConversationData,
    importConversationData
  } = useSurveyResponseStore();

  // Get responses for current conversation
  const currentConversationResponses = useMemo(() => {
    if (!conversationId) return [];
    return getResponsesForConversation(conversationId);
  }, [conversationId, getResponsesForConversation]);

  // Get conversation data for current conversation
  const currentConversationData = useMemo(() => {
    if (!conversationId) return null;
    return getConversationData(conversationId);
  }, [conversationId, getConversationData]);

  // Get progress for current conversation
  const currentProgress = useMemo(() => {
    if (!conversationId) return null;
    return getProgress(conversationId);
  }, [conversationId, getProgress]);

  // Response management
  const handleAddResponse = useCallback(async (
    questionId: string,
    position: 'beginning' | 'turn6' | 'end',
    rating: number
  ) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      setLoading(true);
      clearError();

      const response: SurveyResponse = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        position,
        questionId,
        rating,
        timestamp: new Date().toISOString()
      };

      addResponse(response);

      // Check if section is completed
      const positionResponses = getResponsesForPosition(conversationId, position);
      const template = currentConversationData?.templateId;
      
      // If we have a template, check if all questions for this position are answered
      if (template) {
        // This would need to be implemented with template integration
        // For now, we'll mark as completed if there are responses
        if (positionResponses.length > 0) {
          markSectionCompleted(conversationId, position);
        }
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add response';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, addResponse, getResponsesForPosition, markSectionCompleted, currentConversationData, setLoading, setError, clearError]);

  const handleUpdateResponse = useCallback(async (
    responseId: string,
    updates: Partial<SurveyResponse>
  ) => {
    try {
      setLoading(true);
      clearError();

      updateResponse(responseId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update response';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateResponse, setLoading, setError, clearError]);

  const handleRemoveResponse = useCallback(async (responseId: string) => {
    try {
      setLoading(true);
      clearError();

      removeResponse(responseId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove response';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeResponse, setLoading, setError, clearError]);

  // Position-specific response management
  const getResponsesForPositionInConversation = useCallback((
    position: 'beginning' | 'turn6' | 'end'
  ) => {
    if (!conversationId) return [];
    return getResponsesForPosition(conversationId, position);
  }, [conversationId, getResponsesForPosition]);

  const isPositionCompleted = useCallback((position: 'beginning' | 'turn6' | 'end') => {
    if (!currentConversationData) return false;
    return currentConversationData.completedSections.includes(position);
  }, [currentConversationData]);

  const getPositionProgress = useCallback((position: 'beginning' | 'turn6' | 'end') => {
    const positionResponses = getResponsesForPositionInConversation(position);
    const answeredCount = positionResponses.filter(r => r.rating > 0).length;
    const totalCount = positionResponses.length;
    
    return {
      answered: answeredCount,
      total: totalCount,
      percentage: totalCount > 0 ? (answeredCount / totalCount) * 100 : 0
    };
  }, [getResponsesForPositionInConversation]);

  // Auto-save functionality
  const autoSaveResponse = useCallback(async (
    questionId: string,
    position: 'beginning' | 'turn6' | 'end',
    rating: number
  ) => {
    try {
      // Find existing response for this question and position
      const existingResponse = currentConversationResponses.find(
        r => r.questionId === questionId && r.position === position
      );

      if (existingResponse) {
        // Update existing response
        await handleUpdateResponse(existingResponse.id, { rating });
      } else {
        // Create new response
        await handleAddResponse(questionId, position, rating);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Don't throw error for auto-save failures
    }
  }, [currentConversationResponses, handleUpdateResponse, handleAddResponse]);

  // Data export
  const handleExportConversationData = useCallback(async () => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      setLoading(true);
      clearError();

      const data = exportConversationData(conversationId);
      if (!data) {
        throw new Error('No data found for export');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, exportConversationData, setLoading, setError, clearError]);

  // Data import
  const handleImportConversationData = useCallback(async (data: ConversationSurveyData) => {
    try {
      setLoading(true);
      clearError();

      importConversationData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [importConversationData, setLoading, setError, clearError]);

  // Data clearing
  const handleClearConversationData = useCallback(async () => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      setLoading(true);
      clearError();

      clearConversationData(conversationId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, clearConversationData, setLoading, setError, clearError]);

  return {
    // State
    responses: currentConversationResponses,
    conversationData: currentConversationData,
    progress: currentProgress,
    loading,
    error,
    
    // Response management
    addResponse: handleAddResponse,
    updateResponse: handleUpdateResponse,
    removeResponse: handleRemoveResponse,
    autoSaveResponse,
    
    // Position-specific functions
    getResponsesForPosition: getResponsesForPositionInConversation,
    isPositionCompleted,
    getPositionProgress,
    
    // Data management
    exportData: handleExportConversationData,
    importData: handleImportConversationData,
    clearData: handleClearConversationData,
    
    // Utility functions
    getOverallProgress,
    markSectionCompleted,
    
    // Error handling
    clearError
  };
};
