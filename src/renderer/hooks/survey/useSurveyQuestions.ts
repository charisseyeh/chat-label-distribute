import { useCallback } from 'react';
import { useSurveyQuestionStore } from '../../stores/surveyQuestionStore';
import { SurveyQuestion, SurveyTemplate } from '../../types/survey';
import { QuestionService } from '../../services/survey/questionService';

export const useSurveyQuestions = () => {
  const {
    templates,
    currentTemplate,
    loading,
    error,
    setLoading,
    setError,
    clearError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setCurrentTemplate,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    initializeDefaultTemplate,
    getDefaultQuestions
  } = useSurveyQuestionStore();

  // Template management
  const handleCreateTemplate = useCallback((name: string) => {
    try {
      setLoading(true);
      clearError();
      
      if (!name.trim()) {
        throw new Error('Template name is required');
      }
      
      const template = createTemplate(name);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createTemplate, setLoading, setError, clearError]);

  const handleUpdateTemplate = useCallback((id: string, updates: Partial<SurveyTemplate>) => {
    try {
      setLoading(true);
      clearError();
      
      // Validate template before updating
      if (updates.questions) {
        const validation = QuestionService.validateTemplate({ ...currentTemplate, ...updates } as SurveyTemplate);
        if (!validation.isValid) {
          throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }
      }
      
      updateTemplate(id, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTemplate, updateTemplate, setLoading, setError, clearError]);

  const handleDeleteTemplate = useCallback((id: string) => {
    try {
      setLoading(true);
      clearError();
      
      if (templates.length <= 1) {
        throw new Error('Cannot delete the last template');
      }
      
      deleteTemplate(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates.length, deleteTemplate, setLoading, setError, clearError]);

  // Question management
  const handleAddQuestion = useCallback((templateId: string, questionData: Omit<SurveyQuestion, 'id' | 'order'>) => {
    try {
      setLoading(true);
      clearError();
      
      // Validate question before adding
      const validation = QuestionService.validateQuestion(questionData);
      if (!validation.isValid) {
        throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
      }
      
      addQuestion(templateId, questionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addQuestion, setLoading, setError, clearError]);

  const handleUpdateQuestion = useCallback((templateId: string, questionId: string, updates: Partial<SurveyQuestion>) => {
    try {
      setLoading(true);
      clearError();
      
      // Validate question before updating
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const question = template.questions.find(q => q.id === questionId);
        if (question) {
          const updatedQuestion = { ...question, ...updates };
          const validation = QuestionService.validateQuestion(updatedQuestion);
          if (!validation.isValid) {
            throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
          }
        }
      }
      
      updateQuestion(templateId, questionId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates, updateQuestion, setLoading, setError, clearError]);

  const handleDeleteQuestion = useCallback((templateId: string, questionId: string) => {
    try {
      setLoading(true);
      clearError();
      
      const template = templates.find(t => t.id === templateId);
      if (template && template.questions.length <= 1) {
        throw new Error('Cannot delete the last question');
      }
      
      deleteQuestion(templateId, questionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates, deleteQuestion, setLoading, setError, clearError]);

  const handleReorderQuestions = useCallback((templateId: string, newOrder: string[]) => {
    try {
      setLoading(true);
      clearError();
      
      reorderQuestions(templateId, newOrder);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder questions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reorderQuestions, setLoading, setError, clearError]);

  // Utility functions
  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id) || null;
  }, [templates]);

  const getQuestionsForPosition = useCallback((templateId: string, position: 'beginning' | 'turn6' | 'end') => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return [];
    
    return QuestionService.getQuestionsForPosition(template, position);
  }, [templates]);

  const validateTemplate = useCallback((template: SurveyTemplate) => {
    return QuestionService.validateTemplate(template);
  }, []);

  const validateQuestion = useCallback((question: Partial<SurveyQuestion>) => {
    return QuestionService.validateQuestion(question);
  }, []);

  const createDefaultQuestion = useCallback(() => {
    return QuestionService.createDefaultQuestion();
  }, []);

  const generateDefaultLabels = useCallback((scale: number) => {
    return QuestionService.generateDefaultLabels(scale);
  }, []);

  // Initialize default template on mount
  const initializeTemplate = useCallback(() => {
    if (templates.length === 0) {
      initializeDefaultTemplate();
    }
  }, [templates.length, initializeDefaultTemplate]);

  return {
    // State
    templates,
    currentTemplate,
    loading,
    error,
    
    // Template management
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    setCurrentTemplate,
    
    // Question management
    addQuestion: handleAddQuestion,
    updateQuestion: handleUpdateQuestion,
    deleteQuestion: handleDeleteQuestion,
    reorderQuestions: handleReorderQuestions,
    
    // Utility functions
    getTemplateById,
    getQuestionsForPosition,
    validateTemplate,
    validateQuestion,
    createDefaultQuestion,
    generateDefaultLabels,
    
    // Initialization
    initializeTemplate,
    getDefaultQuestions,
    
    // Error handling
    clearError
  };
};
