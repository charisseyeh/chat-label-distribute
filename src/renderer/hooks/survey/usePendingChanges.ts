import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageActionsStore } from '../../stores/pageActionsStore';
import { SurveyTemplate, SurveyQuestion } from '../../types/survey';

export const usePendingChanges = (
  currentTemplate: SurveyTemplate | null,
  updateQuestion: (templateId: string, questionId: string, questionData: Partial<SurveyQuestion>) => Promise<void>
) => {
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<SurveyQuestion>>>(new Map());
  const { setSaveHandler, clearSaveHandler, setPendingChangesCount } = usePageActionsStore();
  const pendingChangesRef = useRef(pendingChanges);

  // Keep ref in sync with state
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  // Memoize the save handler to prevent recreation
  const saveAllChanges = useCallback(async () => {
    if (!currentTemplate || pendingChangesRef.current.size === 0) return;

    try {
      console.log('💾 Saving all pending changes...');
      // Since updateQuestion is now async, we need to await all updates
      const updatePromises = Array.from(pendingChangesRef.current.entries()).map(([questionId, questionData]) => 
        updateQuestion(currentTemplate.id, questionId, questionData)
      );
      
      await Promise.all(updatePromises);
      
      setPendingChanges(new Map());
      // All changes saved successfully
    } catch (error) {
      console.error('Failed to save changes:', error);
      throw error;
    }
  }, [currentTemplate?.id, updateQuestion]);

  // Set up save handler for the footer - only when template changes
  useEffect(() => {
    console.log('🔄 Setting up save handler for template:', currentTemplate?.id);
    setSaveHandler(saveAllChanges);

    return () => {
      console.log('🧹 Cleaning up save handler for template:', currentTemplate?.id);
      clearSaveHandler();
      setPendingChangesCount(0);
    };
  }, [currentTemplate?.id, saveAllChanges, setSaveHandler, clearSaveHandler, setPendingChangesCount]);

  // Sync pending changes count with the store
  useEffect(() => {
    setPendingChangesCount(pendingChanges.size);
  }, [pendingChanges.size, setPendingChangesCount]);

  return { 
    pendingChanges, 
    setPendingChanges: (changes: Map<string, Partial<SurveyQuestion>>) => {
      setPendingChanges(changes);
    }
  };
};
