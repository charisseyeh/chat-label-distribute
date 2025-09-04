import { create } from 'zustand';
import { AssessmentQuestion, AssessmentTemplate } from '../types/assessment';
import { generateDefaultLabels } from '../utils/assessmentUtils';
import { getDefaultTemplates } from '../services/assessment/defaultTemplatesService';

interface AssessmentQuestionState {
  templates: AssessmentTemplate[];
  currentTemplate: AssessmentTemplate | null;
  loading: boolean;
  error: string | null;
}

interface AssessmentQuestionActions {
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Template management
  createTemplate: (name: string) => Promise<AssessmentTemplate>;
  updateTemplate: (id: string, updates: Partial<AssessmentTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setCurrentTemplate: (template: AssessmentTemplate | null) => void;
  setCurrentTemplateSafely: (template: AssessmentTemplate | null, onConfirm: () => void) => void;
  
  // Question management
  addQuestion: (templateId: string, question: Omit<AssessmentQuestion, 'id' | 'order'>) => Promise<void>;
  updateQuestion: (templateId: string, questionId: string, updates: Partial<AssessmentQuestion>) => Promise<void>;
  deleteQuestion: (templateId: string, questionId: string) => Promise<void>;
  reorderQuestions: (templateId: string, questionIds: string[]) => Promise<void>;
  
  // Default template initialization
  initializeDefaultTemplate: () => Promise<void>;
  getDefaultQuestions: () => AssessmentQuestion[];
  
  // Template switching safety
  checkTemplateSwitchImpact: (newTemplate: AssessmentTemplate | null) => {
    hasExistingResponses: boolean;
    responseCount: number;
    willLoseData: boolean;
  };

  // Load templates from file storage
  loadTemplates: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<AssessmentTemplate | null>;
}

type AssessmentQuestionStore = AssessmentQuestionState & AssessmentQuestionActions;

// Get default questions from the first default template (Emotional Wellbeing)
const getDefaultQuestions = (): AssessmentQuestion[] => {
  const defaultTemplates = getDefaultTemplates();
  return defaultTemplates[0]?.questions || [];
};

export const useAssessmentQuestionStore = create<AssessmentQuestionStore>()(
  (set, get) => {
    return {
      // Initial state
      templates: [],
      currentTemplate: null,
      loading: false,
      error: null,

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Load templates from file storage
      loadTemplates: async () => {
        try {
          set({ loading: true, error: null });
          
          if (window.electronAPI?.getAllAssessmentTemplates) {
            const result = await window.electronAPI.getAllAssessmentTemplates();
            if (result.success) {
              const templates = result.data || [];
              
              // If no templates exist, try to initialize default templates
              if (templates.length === 0 && window.electronAPI?.initializeDefaultTemplates) {
                console.log('🔍 No templates found, attempting to initialize default templates...');
                const initResult = await window.electronAPI.initializeDefaultTemplates();
                if (initResult.success && initResult.data?.initialized) {
                  console.log('✅ Default templates initialized, reloading...');
                  // Reload templates after initialization
                  const reloadResult = await window.electronAPI.getAllAssessmentTemplates();
                  if (reloadResult.success) {
                    set({ templates: reloadResult.data || [] });
                  } else {
                    set({ templates: [] });
                  }
                } else {
                  set({ templates: [] });
                }
              } else {
                set({ templates });
              }
            } else {
              set({ error: result.error || 'Failed to load templates' });
            }
          } else {
            // Fallback to empty array if electronAPI is not available
            set({ templates: [] });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load templates' });
        } finally {
          set({ loading: false });
        }
      },

      loadTemplate: async (templateId: string) => {
        try {
          if (window.electronAPI?.getAssessmentTemplate) {
            const result = await window.electronAPI.getAssessmentTemplate(templateId);
            if (result.success) {
              return result.data;
            } else {
              set({ error: result.error || 'Failed to load template' });
              return null;
            }
          }
          return null;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load template' });
          return null;
        }
      },

      // Template management
      createTemplate: async (name) => {
        try {
          set({ loading: true, error: null });
          
          const newTemplate: AssessmentTemplate = {
            id: `template_${Date.now()}`,
            name,
            questions: getDefaultQuestions(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          if (window.electronAPI?.createAssessmentTemplate) {
            const result = await window.electronAPI.createAssessmentTemplate(newTemplate);
            if (result.success) {
              set({ 
                templates: [...get().templates, newTemplate],
                currentTemplate: newTemplate,
                loading: false
              });
              return newTemplate;
            } else {
              throw new Error(result.error || 'Failed to create template');
            }
          } else {
            // Fallback to localStorage if electronAPI is not available
            set({ 
              templates: [...get().templates, newTemplate],
              currentTemplate: newTemplate,
              loading: false
            });
            return newTemplate;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create template',
            loading: false
          });
          throw error;
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          console.log('🔄 AssessmentQuestionStore: updateTemplate called', { id, updates });
          
          if (window.electronAPI?.updateAssessmentTemplate) {
            console.log('📡 Calling electronAPI.updateAssessmentTemplate...');
            const result = await window.electronAPI.updateAssessmentTemplate(id, updates);
            console.log('📡 electronAPI.updateAssessmentTemplate result:', result);
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to update template');
            }
          } else {
            console.warn('⚠️ window.electronAPI.updateAssessmentTemplate not available');
          }
          
          const { templates } = get();
          const updated = templates.map(t => 
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          );
          
          set({ templates: updated });
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === id) {
            const newCurrentTemplate = updated.find(t => t.id === id) || null;
            set({ currentTemplate: newCurrentTemplate });
          }
          
          console.log('✅ AssessmentQuestionStore: updateTemplate completed successfully');
        } catch (error) {
          console.error('❌ AssessmentQuestionStore: updateTemplate failed:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update template' });
          throw error;
        }
      },

      deleteTemplate: async (id) => {
        try {
          if (window.electronAPI?.deleteAssessmentTemplate) {
            const result = await window.electronAPI.deleteAssessmentTemplate(id);
            if (!result.success) {
              throw new Error(result.error || 'Failed to delete template');
            }
          }
          
          const { templates, currentTemplate } = get();
          const filtered = templates.filter(t => t.id !== id);
          set({ templates: filtered });
          
          // Clear current template if it's the one being deleted
          if (currentTemplate?.id === id) {
            set({ currentTemplate: filtered.length > 0 ? filtered[0] : null });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete template' });
          throw error;
        }
      },

      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      
      setCurrentTemplateSafely: (template, onConfirm) => {
        // This will be implemented to show confirmation dialog
        // For now, just call the callback and set the template
        onConfirm();
        set({ currentTemplate: template });
      },

      // Question management
      addQuestion: async (templateId, questionData) => {
        try {
          const { templates } = get();
          const template = templates.find(t => t.id === templateId);
          if (!template) return;

          const newQuestion: AssessmentQuestion = {
            ...questionData,
            id: `question_${Date.now()}`,
            order: template.questions.length + 1
          };

          const updatedTemplate = {
            ...template,
            questions: [...template.questions, newQuestion],
            updatedAt: new Date().toISOString()
          };

          // Update in file storage first
          await get().updateTemplate(templateId, { questions: updatedTemplate.questions });
          
          // Then update local state
          const updatedTemplates = templates.map(t => 
            t.id === templateId ? updatedTemplate : t
          );

          set({ templates: updatedTemplates });
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === templateId) {
            set({ currentTemplate: updatedTemplate });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add question' });
          throw error;
        }
      },

      updateQuestion: async (templateId, questionId, updates) => {
        try {
          const { templates } = get();
          const template = templates.find(t => t.id === templateId);
          if (!template) return;

          const updatedQuestions = template.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          );

          const updatedTemplate = {
            ...template,
            questions: updatedQuestions,
            updatedAt: new Date().toISOString()
          };

          // Update in file storage first
          await get().updateTemplate(templateId, { questions: updatedQuestions });
          
          // Then update local state
          const updatedTemplates = templates.map(t => 
            t.id === templateId ? updatedTemplate : t
          );

          set({ templates: updatedTemplates });
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === templateId) {
            set({ currentTemplate: updatedTemplate });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update question' });
          throw error;
        }
      },

      deleteQuestion: async (templateId, questionId) => {
        try {
          const { templates } = get();
          const template = templates.find(t => t.id === templateId);
          if (!template) return;

          const filteredQuestions = template.questions
            .filter(q => q.id !== questionId)
            .map((q, index) => ({ ...q, order: index + 1 })); // Reorder remaining questions

          const updatedTemplate = {
            ...template,
            questions: filteredQuestions,
            updatedAt: new Date().toISOString()
          };

          // Update in file storage first
          await get().updateTemplate(templateId, { questions: filteredQuestions });
          
          // Then update local state
          const updatedTemplates = templates.map(t => 
            t.id === templateId ? updatedTemplate : t
          );

          set({ templates: updatedTemplates });
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === templateId) {
            set({ currentTemplate: updatedTemplate });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete question' });
          throw error;
        }
      },

      reorderQuestions: async (templateId, questionIds) => {
        try {
          const { templates } = get();
          const template = templates.find(t => t.id === templateId);
          if (!template) return;

          const reorderedQuestions = questionIds.map((id, index) => {
            const question = template.questions.find(q => q.id === id);
            return question ? { ...question, order: index + 1 } : null;
          }).filter(Boolean) as AssessmentQuestion[];

          const updatedTemplate = {
            ...template,
            questions: reorderedQuestions,
            updatedAt: new Date().toISOString()
          };

          // Update in file storage first
          await get().updateTemplate(templateId, { questions: reorderedQuestions });
          
          // Then update local state
          const updatedTemplates = templates.map(t => 
            t.id === templateId ? updatedTemplate : t
          );

          set({ templates: updatedTemplates });
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === templateId) {
            set({ currentTemplate: updatedTemplate });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reorder questions' });
          throw error;
        }
      },

      // Default template initialization
      initializeDefaultTemplate: async () => {
        try {
          await get().loadTemplates();
          const { templates } = get();
          
          // Just set the current template if none is selected
          if (templates.length > 0 && !get().currentTemplate) {
            set({ currentTemplate: templates[0] });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initialize default template' });
        }
      },

      getDefaultQuestions: () => getDefaultQuestions(),

      // Template switching safety
      checkTemplateSwitchImpact: (newTemplate) => {
        const currentTemplate = get().currentTemplate;

        if (!currentTemplate) {
          return {
            hasExistingResponses: false,
            responseCount: 0,
            willLoseData: false
          };
        }

        // For now, return a basic check - this will be enhanced when we integrate with assessment response store
        return {
          hasExistingResponses: false,
          responseCount: 0,
          willLoseData: false
        };
      },
    };
  }
);
