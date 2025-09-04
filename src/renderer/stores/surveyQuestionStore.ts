import { create } from 'zustand';
import { SurveyQuestion, SurveyTemplate } from '../types/survey';
import { generateDefaultLabels } from '../utils/surveyUtils';
import { DEFAULT_TEMPLATES } from '../constants/defaultTemplates';

interface SurveyQuestionState {
  templates: SurveyTemplate[];
  currentTemplate: SurveyTemplate | null;
  loading: boolean;
  error: string | null;
}

interface SurveyQuestionActions {
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Template management
  createTemplate: (name: string) => Promise<SurveyTemplate>;
  updateTemplate: (id: string, updates: Partial<SurveyTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setCurrentTemplate: (template: SurveyTemplate | null) => void;
  setCurrentTemplateSafely: (template: SurveyTemplate | null, onConfirm: () => void) => void;
  
  // Question management
  addQuestion: (templateId: string, question: Omit<SurveyQuestion, 'id' | 'order'>) => Promise<void>;
  updateQuestion: (templateId: string, questionId: string, updates: Partial<SurveyQuestion>) => Promise<void>;
  deleteQuestion: (templateId: string, questionId: string) => Promise<void>;
  reorderQuestions: (templateId: string, questionIds: string[]) => Promise<void>;
  
  // Default template initialization
  initializeDefaultTemplate: () => Promise<void>;
  getDefaultQuestions: () => SurveyQuestion[];
  
  // Template switching safety
  checkTemplateSwitchImpact: (newTemplate: SurveyTemplate | null) => {
    hasExistingResponses: boolean;
    responseCount: number;
    willLoseData: boolean;
  };

  // Load templates from file storage
  loadTemplates: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<SurveyTemplate | null>;
}

type SurveyQuestionStore = SurveyQuestionState & SurveyQuestionActions;

// Default survey questions - now using the first template's questions as fallback
const getDefaultQuestions = (): SurveyQuestion[] => {
  return DEFAULT_TEMPLATES[0]?.questions || [];
};

export const useSurveyQuestionStore = create<SurveyQuestionStore>()(
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
          
          if (window.electronAPI?.getAllSurveyTemplates) {
            const result = await window.electronAPI.getAllSurveyTemplates();
            if (result.success) {
              set({ templates: result.data || [] });
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
          if (window.electronAPI?.getSurveyTemplate) {
            const result = await window.electronAPI.getSurveyTemplate(templateId);
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
          
          const newTemplate: SurveyTemplate = {
            id: `template_${Date.now()}`,
            name,
            questions: getDefaultQuestions(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          if (window.electronAPI?.createSurveyTemplate) {
            const result = await window.electronAPI.createSurveyTemplate(newTemplate);
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
          console.log('🔄 SurveyQuestionStore: updateTemplate called', { id, updates });
          
          if (window.electronAPI?.updateSurveyTemplate) {
            console.log('📡 Calling electronAPI.updateSurveyTemplate...');
            const result = await window.electronAPI.updateSurveyTemplate(id, updates);
            console.log('📡 electronAPI.updateSurveyTemplate result:', result);
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to update template');
            }
          } else {
            console.warn('⚠️ window.electronAPI.updateSurveyTemplate not available');
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
          
          console.log('✅ SurveyQuestionStore: updateTemplate completed successfully');
        } catch (error) {
          console.error('❌ SurveyQuestionStore: updateTemplate failed:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update template' });
          throw error;
        }
      },

      deleteTemplate: async (id) => {
        try {
          if (window.electronAPI?.deleteSurveyTemplate) {
            const result = await window.electronAPI.deleteSurveyTemplate(id);
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

          const newQuestion: SurveyQuestion = {
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
          }).filter(Boolean) as SurveyQuestion[];

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
          
          if (templates.length === 0) {
            // Create all default templates
            const createdTemplates: SurveyTemplate[] = [];
            
            for (const template of DEFAULT_TEMPLATES) {
              try {
                if (window.electronAPI?.createSurveyTemplate) {
                  const result = await window.electronAPI.createSurveyTemplate(template);
                  if (result.success) {
                    createdTemplates.push(template);
                  }
                } else {
                  // Fallback to localStorage if electronAPI is not available
                  createdTemplates.push(template);
                }
              } catch (error) {
                console.error(`Failed to create template "${template.name}":`, error);
              }
            }
            
            // Update the store with created templates
            set({ 
              templates: createdTemplates,
              currentTemplate: createdTemplates[0] || null
            });
          } else if (!get().currentTemplate) {
            set({ currentTemplate: templates[0] });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to initialize default templates' });
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

        // For now, return a basic check - this will be enhanced when we integrate with survey response store
        return {
          hasExistingResponses: false,
          responseCount: 0,
          willLoseData: false
        };
      },
    };
  }
);
