import { create } from 'zustand';

interface PageActionsState {
  saveHandler: (() => Promise<void>) | null;
  pendingChangesCount: number;
  setSaveHandler: (handler: (() => Promise<void>) | null) => void;
  setPendingChangesCount: (count: number) => void;
  clearSaveHandler: () => void;
}

export const usePageActionsStore = create<PageActionsState>((set) => ({
  saveHandler: null,
  pendingChangesCount: 0,
  setSaveHandler: (handler) => set({ saveHandler: handler }),
  setPendingChangesCount: (count) => set({ pendingChangesCount: count }),
  clearSaveHandler: () => set({ saveHandler: null, pendingChangesCount: 0 }),
}));
