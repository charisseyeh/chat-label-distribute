import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SurveyQuestion, SurveyTemplate } from '../types/survey';

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
  createTemplate: (name: string) => SurveyTemplate;
  updateTemplate: (id: string, updates: Partial<SurveyTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (template: SurveyTemplate | null) => void;
  setCurrentTemplateSafely: (template: SurveyTemplate | null, onConfirm: () => void) => void;
  
  // Question management
  addQuestion: (templateId: string, question: Omit<SurveyQuestion, 'id' | 'order'>) => void;
  updateQuestion: (templateId: string, questionId: string, updates: Partial<SurveyQuestion>) => void;
  deleteQuestion: (templateId: string, questionId: string) => void;
  reorderQuestions: (templateId: string, questionIds: string[]) => void;
  
  // Default template initialization
  initializeDefaultTemplate: () => void;
  getDefaultQuestions: () => SurveyQuestion[];
  
  // Template switching safety
  checkTemplateSwitchImpact: (newTemplate: SurveyTemplate | null) => {
    hasExistingResponses: boolean;
    responseCount: number;
    willLoseData: boolean;
  };
}

type SurveyQuestionStore = SurveyQuestionState & SurveyQuestionActions;

// Default survey questions based on the existing implementation
const getDefaultQuestions = (): SurveyQuestion[] => [
  {
    id: 'mood',
    text: 'How would you rate the overall mood or emotional tone?',
    scale: 7,
    labels: {
      1: 'Very negative',
      2: 'Negative', 
      3: 'Somewhat negative',
      4: 'Neutral',
      5: 'Somewhat positive',
      6: 'Positive',
      7: 'Very positive'
    },
    order: 1
  },
  {
    id: 'emotional_regulation',
    text: 'How well is the person managing and controlling their emotions?',
    scale: 7,
    labels: {
      1: 'Poor control',
      2: 'Below average',
      3: 'Somewhat poor',
      4: 'Average',
      5: 'Somewhat good',
      6: 'Good control',
      7: 'Excellent control'
    },
    order: 2
  },
  {
    id: 'stress',
    text: 'How stressed or overwhelmed does the person appear to be?',
    scale: 7,
    labels: {
      1: 'Extremely stressed',
      2: 'Very stressed',
      3: 'Stressed',
      4: 'Moderate',
      5: 'Somewhat relaxed',
      6: 'Relaxed',
      7: 'No stress'
    },
    order: 3
  },
  {
    id: 'energy',
    text: 'How energetic and engaged does the person seem?',
    scale: 7,
    labels: {
      1: 'Very low energy',
      2: 'Low energy',
      3: 'Somewhat low',
      4: 'Moderate',
      5: 'Somewhat high',
      6: 'High energy',
      7: 'Very high energy'
    },
    order: 4
  },
  {
    id: 'wellbeing',
    text: 'How would you rate the person\'s overall psychological wellbeing?',
    scale: 7,
    labels: {
      1: 'Very poor',
      2: 'Poor',
      3: 'Below average',
      4: 'Average',
      5: 'Above average',
      6: 'Good',
      7: 'Excellent'
    },
    order: 5
  }
];

export const useSurveyQuestionStore = create<SurveyQuestionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: [],
      currentTemplate: null,
      loading: false,
      error: null,

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Template management
      createTemplate: (name) => {
        const { templates } = get();
        const newTemplate: SurveyTemplate = {
          id: `template_${Date.now()}`,
          name,
          questions: getDefaultQuestions(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set({ 
          templates: [...templates, newTemplate],
          currentTemplate: newTemplate
        });
        
        return newTemplate;
      },

      updateTemplate: (id, updates) => {
        const { templates } = get();
        const updated = templates.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
        set({ templates: updated });
        
        // Update current template if it's the one being updated
        const { currentTemplate } = get();
        if (currentTemplate?.id === id) {
          set({ currentTemplate: updated.find(t => t.id === id) || null });
        }
      },

      deleteTemplate: (id) => {
        const { templates, currentTemplate } = get();
        const filtered = templates.filter(t => t.id !== id);
        set({ templates: filtered });
        
        // Clear current template if it's the one being deleted
        if (currentTemplate?.id === id) {
          set({ currentTemplate: filtered.length > 0 ? filtered[0] : null });
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
      addQuestion: (templateId, questionData) => {
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

        const updatedTemplates = templates.map(t => 
          t.id === templateId ? updatedTemplate : t
        );

        set({ templates: updatedTemplates });
        
        // Update current template if it's the one being updated
        const { currentTemplate } = get();
        if (currentTemplate?.id === templateId) {
          set({ currentTemplate: updatedTemplate });
        }
      },

      updateQuestion: (templateId, questionId, updates) => {
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

        const updatedTemplates = templates.map(t => 
          t.id === templateId ? updatedTemplate : t
        );

        set({ templates: updatedTemplates });
        
        // Update current template if it's the one being updated
        const { currentTemplate } = get();
        if (currentTemplate?.id === templateId) {
          set({ currentTemplate: updatedTemplate });
        }
      },

      deleteQuestion: (templateId, questionId) => {
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

        const updatedTemplates = templates.map(t => 
          t.id === templateId ? updatedTemplate : t
        );

        set({ templates: updatedTemplates });
        
        // Update current template if it's the one being updated
        const { currentTemplate } = get();
        if (currentTemplate?.id === templateId) {
          set({ currentTemplate: updatedTemplate });
        }
      },

      reorderQuestions: (templateId, questionIds) => {
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

        const updatedTemplates = templates.map(t => 
          t.id === templateId ? updatedTemplate : t
        );

        set({ templates: updatedTemplates });
        
        // Update current template if it's the one being updated
        const { currentTemplate } = get();
        if (currentTemplate?.id === templateId) {
          set({ currentTemplate: updatedTemplate });
        }
      },

      // Default template initialization
      initializeDefaultTemplate: () => {
        const { templates } = get();
        if (templates.length === 0) {
          const defaultTemplate = get().createTemplate('Default Survey Template');
          set({ currentTemplate: defaultTemplate });
        } else if (!get().currentTemplate) {
          set({ currentTemplate: templates[0] });
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
    }),
    {
      name: 'survey-question-storage',
      partialize: (state) => ({ 
        templates: state.templates,
        currentTemplate: state.currentTemplate
      }),
    }
  )
);
