import { useCallback } from 'react';
import { useAssessmentQuestionStore } from '../../stores/assessmentQuestionStore';
import { AssessmentQuestion, AssessmentTemplate } from '../../types/assessment';
import { QuestionService } from '../../services/assessment/questionService';

export const useAssessmentQuestions = () => {
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
    getDefaultQuestions,
    loadTemplates,
    loadTemplate
  } = useAssessmentQuestionStore();

  // Template loading
  const handleLoadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      await loadTemplates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplates, setLoading, setError, clearError]);

  const handleLoadTemplate = useCallback(async (templateId: string) => {
    try {
      setLoading(true);
      clearError();
      const template = await loadTemplate(templateId);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTemplate, setLoading, setError, clearError]);

  // Template management
  const handleCreateTemplate = useCallback(async (name: string) => {
    try {
      setLoading(true);
      clearError();
      
      if (!name.trim()) {
        throw new Error('Template name is required');
      }
      
      const template = await createTemplate(name);
      return template;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [createTemplate, setLoading, setError, clearError]);

  const handleUpdateTemplate = useCallback(async (id: string, updates: Partial<AssessmentTemplate>) => {
    try {
      console.log('🔄 useAssessmentQuestions: handleUpdateTemplate called', { id, updates });
      setLoading(true);
      clearError();
      
      // Validate template before updating
      if (updates.questions) {
        console.log('🔍 Validating template with questions...');
        const templateToValidate = { ...currentTemplate, ...updates } as AssessmentTemplate;
        console.log('📋 Template to validate:', templateToValidate);
        const validation = QuestionService.validateTemplate(templateToValidate);
        console.log('✅ Validation result:', validation);
        
        if (!validation.isValid) {
          console.error('❌ Template validation failed:', validation.errors);
          throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }
      }
      
      console.log('📡 Calling store updateTemplate...');
      await updateTemplate(id, updates);
      console.log('✅ Store updateTemplate completed');
    } catch (err) {
      console.error('❌ useAssessmentQuestions: handleUpdateTemplate failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentTemplate, updateTemplate, setLoading, setError, clearError]);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      clearError();
      
      if (templates.length <= 1) {
        throw new Error('Cannot delete the last template');
      }
      
      await deleteTemplate(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates.length, deleteTemplate, setLoading, setError, clearError]);

  // Question management
  const handleAddQuestion = useCallback(async (templateId: string, questionData: Omit<AssessmentQuestion, 'id' | 'order'>) => {
    try {
      setLoading(true);
      clearError();
      
      // Validate question before adding
      const validation = QuestionService.validateQuestion(questionData);
      if (!validation.isValid) {
        throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
      }
      
      await addQuestion(templateId, questionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addQuestion, setLoading, setError, clearError]);

  const handleUpdateQuestion = useCallback(async (templateId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
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
      
      await updateQuestion(templateId, questionId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates, updateQuestion, setLoading, setError, clearError]);

  const handleDeleteQuestion = useCallback(async (templateId: string, questionId: string) => {
    try {
      setLoading(true);
      clearError();
      
      const template = templates.find(t => t.id === templateId);
      if (template && template.questions.length <= 1) {
        throw new Error('Cannot delete the last question');
      }
      
      await deleteQuestion(templateId, questionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [templates, deleteQuestion, setLoading, setError, clearError]);

  const handleReorderQuestions = useCallback(async (templateId: string, newOrder: string[]) => {
    try {
      setLoading(true);
      clearError();
      
      await reorderQuestions(templateId, newOrder);
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

  const validateTemplate = useCallback((template: AssessmentTemplate) => {
    return QuestionService.validateTemplate(template);
  }, []);

  const validateQuestion = useCallback((question: Partial<AssessmentQuestion>) => {
    return QuestionService.validateQuestion(question);
  }, []);

  const createDefaultQuestion = useCallback(() => {
    return QuestionService.createDefaultQuestion();
  }, []);

  const generateDefaultLabels = useCallback((scale: number) => {
    return QuestionService.generateDefaultLabels(scale);
  }, []);

  // Initialize default template on mount (now handled by main process)
  const initializeTemplate = useCallback(async () => {
    // Templates are now initialized by the main process on app startup
    // This hook just ensures we have a current template selected
    if (templates.length > 0 && !currentTemplate) {
      setCurrentTemplate(templates[0]);
    }
  }, [templates.length, currentTemplate, setCurrentTemplate]);

  return {
    // State
    templates,
    currentTemplate,
    loading,
    error,
    
    // Template loading
    loadTemplates: handleLoadTemplates,
    loadTemplate: handleLoadTemplate,
    
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
