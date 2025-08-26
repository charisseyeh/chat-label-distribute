import { useState, useEffect } from 'react';

interface StoredFile {
  id: string;
  originalName: string;
  storedPath: string;
  importDate: string;
  fileSize: number;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  averageSize: number;
}

export const useFileManager = () => {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  const loadStoredFiles = async () => {
    try {
      if (!window.electronAPI) return;

      const result = await window.electronAPI.getStoredFiles();
      if (result.success && result.data) {
        setStoredFiles(result.data as StoredFile[]);
      }
    } catch (error) {
      console.error('Failed to load stored files:', error);
    }
  };

  const loadStorageStats = async () => {
    try {
      if (!window.electronAPI) return;
      
      const result = await window.electronAPI.getStorageStats();
      if (result.success && result.data) {
        setStorageStats(result.data as StorageStats);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      if (!window.electronAPI) return false;

      const result = await window.electronAPI.deleteStoredFile(fileId);
      if (result.success) {
        await loadStoredFiles();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete stored file:', error);
      return false;
    }
  };

  useEffect(() => {
    loadStoredFiles();
    loadStorageStats();
  }, []);

  return {
    storedFiles,
    storageStats,
    loadStoredFiles,
    deleteFile
  };
};
