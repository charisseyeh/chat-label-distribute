import { create } from 'zustand';

interface AIComparisonState {
  exportHandler: (() => void) | null;
  hasComparisonData: boolean;
}

interface AIComparisonActions {
  setExportHandler: (handler: (() => void) | null) => void;
  setHasComparisonData: (hasData: boolean) => void;
  clearExportHandler: () => void;
}

type AIComparisonStore = AIComparisonState & AIComparisonActions;

export const useAIComparisonStore = create<AIComparisonStore>()((set) => ({
  // Initial state
  exportHandler: null,
  hasComparisonData: false,

  // Actions
  setExportHandler: (handler) => set({ exportHandler: handler }),
  setHasComparisonData: (hasData) => set({ hasComparisonData: hasData }),
  clearExportHandler: () => set({ exportHandler: null, hasComparisonData: false }),
}));
