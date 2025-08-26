declare global {
  interface Window {
    electronAPI: {
      selectConversationFile: () => Promise<string | null>;
      storeJsonFile: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    };
  }
}

export {};
