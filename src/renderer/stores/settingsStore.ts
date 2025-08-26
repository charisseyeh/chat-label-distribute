import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AISettings {
  apiKey: string;
  model: string;
  enableAIFiltering: boolean;
}

export interface SettingsState {
  ai: AISettings;
  updateAISettings: (settings: Partial<AISettings>) => void;
  resetAISettings: () => void;
}

const defaultAISettings: AISettings = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  enableAIFiltering: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ai: defaultAISettings,
      
      updateAISettings: (newSettings: Partial<AISettings>) =>
        set((state) => ({
          ai: { ...state.ai, ...newSettings }
        })),
      
      resetAISettings: () =>
        set(() => ({
          ai: defaultAISettings
        })),
    }),
    {
      name: 'chat-labeling-settings',
      partialize: (state) => ({ ai: state.ai }),
    }
  )
);
