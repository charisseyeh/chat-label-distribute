import { create } from 'zustand';

interface PageActionsState {
  saveHandler: (() => Promise<void>) | null;
  pendingChangesCount: number;
  showSaveFeedback: boolean;
  setSaveHandler: (handler: (() => Promise<void>) | null) => void;
  setPendingChangesCount: (count: number) => void;
  setShowSaveFeedback: (show: boolean) => void;
  clearSaveHandler: () => void;
}

export const usePageActionsStore = create<PageActionsState>((set) => ({
  saveHandler: null,
  pendingChangesCount: 0,
  showSaveFeedback: false,
  setSaveHandler: (handler) => set({ saveHandler: handler }),
  setPendingChangesCount: (count) => set({ pendingChangesCount: count }),
  setShowSaveFeedback: (show) => set({ showSaveFeedback: show }),
  clearSaveHandler: () => set({ saveHandler: null, pendingChangesCount: 0, showSaveFeedback: false }),
}));
