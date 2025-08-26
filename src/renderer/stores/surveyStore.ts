import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SurveyResponse {
  id: string;
  conversationId: string;
  position: 'beginning' | 'turn6' | 'end';
  ratings: Record<string, number>;
  notes: string;
  timestamp: string;
}

export interface SurveyDimension {
  id: string;
  name: string;
  description: string;
  options: string[];
  scale: number;
}

interface SurveyState {
  responses: SurveyResponse[];
  dimensions: SurveyDimension[];
  loading: boolean;
  error: string | null;
}

interface SurveyActions {
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Survey responses
  addResponse: (response: SurveyResponse) => void;
  updateResponse: (id: string, updates: Partial<SurveyResponse>) => void;
  removeResponse: (id: string) => void;
  getResponsesForConversation: (conversationId: string) => SurveyResponse[];
  
  // Survey dimensions (could be configurable later)
  setDimensions: (dimensions: SurveyDimension[]) => void;
}

type SurveyStore = SurveyState & SurveyActions;

// Default survey dimensions (matching what's already implemented)
const DEFAULT_DIMENSIONS: SurveyDimension[] = [
  {
    id: 'mood',
    name: 'Mood State',
    description: 'How would you rate the overall mood or emotional tone?',
    options: ['Very negative', 'Negative', 'Somewhat negative', 'Neutral', 'Somewhat positive', 'Positive', 'Very positive'],
    scale: 7
  },
  {
    id: 'emotional_regulation',
    name: 'Emotional Regulation',
    description: 'How well is the person managing and controlling their emotions?',
    options: ['Poor control', 'Below average', 'Somewhat poor', 'Average', 'Somewhat good', 'Good control', 'Excellent control'],
    scale: 7
  },
  {
    id: 'stress',
    name: 'Stress Level',
    description: 'How stressed or overwhelmed does the person appear to be?',
    options: ['Extremely stressed', 'Very stressed', 'Stressed', 'Moderate', 'Somewhat relaxed', 'Relaxed', 'No stress'],
    scale: 7
  },
  {
    id: 'energy',
    name: 'Energy Level',
    description: 'How energetic and engaged does the person seem?',
    options: ['Very low energy', 'Low energy', 'Somewhat low', 'Moderate', 'Somewhat high', 'High energy', 'Very high energy'],
    scale: 7
  },
  {
    id: 'wellbeing',
    name: 'Overall Wellbeing',
    description: 'How would you rate the person\'s overall psychological wellbeing?',
    options: ['Very poor', 'Poor', 'Below average', 'Average', 'Above average', 'Good', 'Excellent'],
    scale: 7
  }
];

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      responses: [],
      dimensions: DEFAULT_DIMENSIONS,
      loading: false,
      error: null,

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Survey responses
      addResponse: (response) => {
        const { responses } = get();
        const existingIndex = responses.findIndex(r => 
          r.conversationId === response.conversationId && r.position === response.position
        );
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...responses];
          updated[existingIndex] = response;
          set({ responses: updated });
        } else {
          // Add new
          set({ responses: [...responses, response] });
        }
      },

      updateResponse: (id, updates) => {
        const { responses } = get();
        const updated = responses.map(r => 
          r.id === id ? { ...r, ...updates } : r
        );
        set({ responses: updated });
      },

      removeResponse: (id) => {
        const { responses } = get();
        const filtered = responses.filter(r => r.id !== id);
        set({ responses: filtered });
      },

      getResponsesForConversation: (conversationId) => {
        const { responses } = get();
        return responses.filter(r => r.conversationId === conversationId);
      },

      // Survey dimensions
      setDimensions: (dimensions) => set({ dimensions }),
    }),
    {
      name: 'survey-storage',
      // Only persist responses and dimensions, not loading/error states
      partialize: (state) => ({ 
        responses: state.responses,
        dimensions: state.dimensions
      }),
    }
  )
);
