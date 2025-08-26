import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SurveyResponse, ConversationSurveyData, SurveyProgress } from '../types/survey';

interface SurveyResponseState {
  responses: SurveyResponse[];
  conversationData: Record<string, ConversationSurveyData>;
  loading: boolean;
  error: string | null;
}

interface SurveyResponseActions {
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Response management
  addResponse: (response: SurveyResponse) => void;
  updateResponse: (id: string, updates: Partial<SurveyResponse>) => void;
  removeResponse: (id: string) => void;
  getResponsesForConversation: (conversationId: string) => SurveyResponse[];
  getResponsesForPosition: (conversationId: string, position: 'beginning' | 'turn6' | 'end') => SurveyResponse[];
  
  // Conversation data management
  getConversationData: (conversationId: string) => ConversationSurveyData;
  updateConversationData: (conversationId: string, data: Partial<ConversationSurveyData>) => void;
  markSectionCompleted: (conversationId: string, position: 'beginning' | 'turn6' | 'end') => void;
  
  // Progress tracking
  getProgress: (conversationId: string) => SurveyProgress;
  getOverallProgress: () => SurveyProgress;
  
  // Data persistence
  clearConversationData: (conversationId: string) => void;
  exportConversationData: (conversationId: string) => ConversationSurveyData | null;
  importConversationData: (data: ConversationSurveyData) => void;
}

type SurveyResponseStore = SurveyResponseState & SurveyResponseActions;

export const useSurveyResponseStore = create<SurveyResponseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      responses: [],
      conversationData: {},
      loading: false,
      error: null,

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Response management
      addResponse: (response) => {
        const { responses, conversationData } = get();
        
        // Add to responses array
        const existingIndex = responses.findIndex(r => 
          r.id === response.id
        );
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...responses];
          updated[existingIndex] = response;
          set({ responses: updated });
        } else {
          // Add new
          const newResponses = [...responses, response];
          set({ responses: newResponses });
        }
        
        // Update conversation data
        const conversationId = response.conversationId;
        const existingData = conversationData[conversationId] || {
          conversationId,
          responses: [],
          completedSections: [],
          lastUpdated: new Date().toISOString()
        };
        
        const updatedResponses = existingData.responses.filter(r => r.questionId !== response.questionId);
        updatedResponses.push(response);
        
        const updatedData: ConversationSurveyData = {
          ...existingData,
          responses: updatedResponses,
          lastUpdated: new Date().toISOString()
        };
        
        set({
          conversationData: {
            ...conversationData,
            [conversationId]: updatedData
          }
        });
      },

      updateResponse: (id, updates) => {
        const { responses, conversationData } = get();
        const updated = responses.map(r => 
          r.id === id ? { ...r, ...updates, timestamp: new Date().toISOString() } : r
        );
        set({ responses: updated });
        
        // Also update conversation data directly instead of calling addResponse to avoid infinite loop
        const response = updated.find(r => r.id === id);
        if (response) {
          const conversationId = response.conversationId;
          const existingData = conversationData[conversationId] || {
            conversationId,
            responses: [],
            completedSections: [],
            lastUpdated: new Date().toISOString()
          };
          
          const updatedResponses = existingData.responses.filter(r => r.questionId !== response.questionId);
          updatedResponses.push(response);
          
          const updatedData: ConversationSurveyData = {
            ...existingData,
            responses: updatedResponses,
            lastUpdated: new Date().toISOString()
          };
          
          set({
            conversationData: {
              ...conversationData,
              [conversationId]: updatedData
            }
          });
        }
      },

      removeResponse: (id) => {
        const { responses, conversationData } = get();
        const response = responses.find(r => r.id === id);
        if (!response) return;
        
        const filtered = responses.filter(r => r.id !== id);
        set({ responses: filtered });
        
        // Update conversation data
        const conversationId = response.conversationId;
        const existingData = conversationData[conversationId];
        if (existingData) {
          const updatedResponses = existingData.responses.filter(r => r.id !== id);
          const updatedData: ConversationSurveyData = {
            ...existingData,
            responses: updatedResponses,
            lastUpdated: new Date().toISOString()
          };
          
          set({
            conversationData: {
              ...conversationData,
              [conversationId]: updatedData
            }
          });
        }
      },

      getResponsesForConversation: (conversationId) => {
        const { responses } = get();
        return responses.filter(r => r.conversationId === conversationId);
      },

      getResponsesForPosition: (conversationId, position) => {
        const { responses } = get();
        return responses.filter(r => 
          r.conversationId === conversationId && r.position === position
        );
      },

      // Conversation data management
      getConversationData: (conversationId) => {
        const { conversationData } = get();
        return conversationData[conversationId] || {
          conversationId,
          responses: [],
          completedSections: [],
          lastUpdated: new Date().toISOString()
        };
      },

      updateConversationData: (conversationId, data) => {
        const { conversationData } = get();
        const existing = conversationData[conversationId] || {
          conversationId,
          responses: [],
          completedSections: [],
          lastUpdated: new Date().toISOString()
        };
        
        const updated: ConversationSurveyData = {
          ...existing,
          ...data,
          lastUpdated: new Date().toISOString()
        };
        
        set({
          conversationData: {
            ...conversationData,
            [conversationId]: updated
          }
        });
      },

      markSectionCompleted: (conversationId, position) => {
        const { conversationData } = get();
        const existing = conversationData[conversationId];
        if (!existing) return;
        
        const completedSections = existing.completedSections.includes(position) 
          ? existing.completedSections 
          : [...existing.completedSections, position];
        
        get().updateConversationData(conversationId, { completedSections });
      },

      // Progress tracking
      getProgress: (conversationId) => {
        const { conversationData } = get();
        const data = conversationData[conversationId];
        if (!data) {
          return {
            totalQuestions: 0,
            answeredQuestions: 0,
            completedSections: [],
            overallProgress: 0
          };
        }
        
        const totalQuestions = data.responses.length;
        const answeredQuestions = data.responses.filter(r => r.rating > 0).length;
        const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        
        return {
          totalQuestions,
          answeredQuestions,
          completedSections: data.completedSections,
          overallProgress
        };
      },

      getOverallProgress: () => {
        const { conversationData } = get();
        const conversationIds = Object.keys(conversationData);
        
        if (conversationIds.length === 0) {
          return {
            totalQuestions: 0,
            answeredQuestions: 0,
            completedSections: [],
            overallProgress: 0
          };
        }
        
        let totalQuestions = 0;
        let answeredQuestions = 0;
        const allCompletedSections: string[] = [];
        
        conversationIds.forEach(id => {
          const data = conversationData[id];
          totalQuestions += data.responses.length;
          answeredQuestions += data.responses.filter(r => r.rating > 0).length;
          allCompletedSections.push(...data.completedSections);
        });
        
        const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
        
        return {
          totalQuestions,
          answeredQuestions,
          completedSections: [...new Set(allCompletedSections)],
          overallProgress
        };
      },

      // Data persistence
      clearConversationData: (conversationId) => {
        const { responses, conversationData } = get();
        
        // Remove responses for this conversation
        const filteredResponses = responses.filter(r => r.conversationId !== conversationId);
        
        // Remove conversation data
        const { [conversationId]: removed, ...remainingData } = conversationData;
        
        set({
          responses: filteredResponses,
          conversationData: remainingData
        });
      },

      exportConversationData: (conversationId) => {
        const { conversationData } = get();
        return conversationData[conversationId] || null;
      },

      importConversationData: (data) => {
        const { conversationData, responses } = get();
        
        // Add conversation data
        const updatedConversationData = {
          ...conversationData,
          [data.conversationId]: data
        };
        
        // Add responses
        const existingResponseIds = new Set(responses.map(r => r.id));
        const newResponses = data.responses.filter(r => !existingResponseIds.has(r.id));
        const updatedResponses = [...responses, ...newResponses];
        
        set({
          conversationData: updatedConversationData,
          responses: updatedResponses
        });
      },
    }),
    {
      name: 'survey-response-storage',
      partialize: (state) => ({ 
        responses: state.responses,
        conversationData: state.conversationData
      }),
    }
  )
);
