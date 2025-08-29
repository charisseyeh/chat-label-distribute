import { useState, useEffect, useRef } from 'react';
import { usePageActionsStore } from '../../stores/pageActionsStore';
import { SurveyTemplate, SurveyQuestion } from '../../types/survey';

export const usePendingChanges = (
  currentTemplate: SurveyTemplate | null,
  updateQuestion: (templateId: string, questionId: string, questionData: Partial<SurveyQuestion>) => void
) => {
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<SurveyQuestion>>>(new Map());
  const { setSaveHandler, clearSaveHandler, setPendingChangesCount } = usePageActionsStore();
  const pendingChangesRef = useRef(pendingChanges);

  // Keep ref in sync with state
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  // Set up save handler for the footer
  useEffect(() => {
    const saveAllChanges = async () => {
      if (!currentTemplate || pendingChangesRef.current.size === 0) return;

      try {
        // Since updateQuestion is not async, we can call them all synchronously
        Array.from(pendingChangesRef.current.entries()).forEach(([questionId, questionData]) => {
          updateQuestion(currentTemplate.id, questionId, questionData);
        });
        
        setPendingChanges(new Map());
      } catch (error) {
        console.error('❌ Failed to save changes:', error);
        throw error;
      }
    };

    setSaveHandler(saveAllChanges);

    return () => {
      clearSaveHandler();
      setPendingChangesCount(0);
    };
  }, [currentTemplate, updateQuestion, setSaveHandler, clearSaveHandler, setPendingChangesCount]);

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
