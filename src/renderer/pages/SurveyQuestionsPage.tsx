import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/survey/useSurveyQuestions';
import { usePageActionsStore } from '../stores/pageActionsStore';
import { generateDefaultLabels } from '../utils/surveyUtils';
import { SurveyTemplate, SurveyQuestion } from '../types/survey';
import { TemplateCreationForm, SurveyHeader, EditableQuestionCard } from '../components/survey';

const SurveyQuestionsPage: React.FC = () => {
  const { id: templateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    templates,
    currentTemplate,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setCurrentTemplate,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    initializeTemplate,
    clearError,
    loadTemplates,
    loadTemplate,
    generateDefaultLabels
  } = useSurveyQuestions();

  // Consolidated state management
  const [uiState, setUiState] = useState({
    isCreatingTemplate: false,
    newTemplateName: '',
    globalScale: 7,
    localTitle: '',
    pendingChanges: new Map<string, Partial<SurveyQuestion>>(),
    hasTitleChanges: false,
    hasScaleChanges: false,
    deletedQuestions: new Set<string>()
  });
  
  // Ref to track current state for save function
  const uiStateRef = useRef(uiState);
  
  // Set up save handler for the footer
  const { setSaveHandler, clearSaveHandler, setPendingChangesCount } = usePageActionsStore();
  
  // Update ref when state changes
  useEffect(() => {
    uiStateRef.current = uiState;
  }, [uiState]);
  
  // Helper functions for state updates
  const updateUiState = useCallback((updates: Partial<typeof uiState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updatePendingChanges = useCallback((questionId: string, questionData: Partial<SurveyQuestion>) => {
    setUiState(prev => {
      const newPendingChanges = new Map(prev.pendingChanges);
      newPendingChanges.set(questionId, questionData);
      return { ...prev, pendingChanges: newPendingChanges };
    });
  }, []);
  
  const clearAllChanges = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      pendingChanges: new Map(),
      hasTitleChanges: false,
      hasScaleChanges: false,
      deletedQuestions: new Set()
    }));
  }, []);
  
  // Simplified and efficient save function
  const saveAllChanges = useCallback(async () => {
    if (!currentTemplate) {
      console.log('💾 No template to save');
      return;
    }

    const { pendingChanges, hasTitleChanges, hasScaleChanges, deletedQuestions, localTitle, globalScale } = uiStateRef.current;
    
    console.log('💾 Save function called with state:', {
      pendingChanges: pendingChanges.size,
      hasTitleChanges,
      hasScaleChanges,
      deletedQuestions: deletedQuestions.size
    });
    
    // Check if there are any changes to save
    if (pendingChanges.size === 0 && !hasTitleChanges && !hasScaleChanges && deletedQuestions.size === 0) {
      console.log('💾 No changes to save, returning early');
      return;
    }
    
    try {
      // Prepare template updates
      const templateUpdates: Partial<SurveyTemplate> = {};
      
      // 1. Handle title changes
      if (hasTitleChanges && localTitle !== currentTemplate.name) {
        templateUpdates.name = localTitle;
        console.log('📝 Title update:', { from: currentTemplate.name, to: localTitle });
      }
      
      // 2. Handle question changes (scale, individual changes, deletions)
      if (hasScaleChanges || deletedQuestions.size > 0 || pendingChanges.size > 0) {
        let updatedQuestions = [...currentTemplate.questions];
        
        // Apply individual question changes
        Array.from(pendingChanges.entries()).forEach(([questionId, questionData]) => {
          if (!deletedQuestions.has(questionId)) {
            const questionIndex = updatedQuestions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
              updatedQuestions[questionIndex] = {
                ...updatedQuestions[questionIndex],
                ...questionData
              };
            }
          }
        });
        
        // Apply scale changes to all questions
        if (hasScaleChanges) {
          const defaultLabels = generateDefaultLabels(globalScale);
          updatedQuestions = updatedQuestions.map(question => ({
            ...question,
            scale: globalScale,
            labels: defaultLabels
          }));
        }
        
        // Remove deleted questions and reorder
        updatedQuestions = updatedQuestions
          .filter(question => !deletedQuestions.has(question.id))
          .map((question, index) => ({
            ...question,
            order: index + 1
          }));
        
        templateUpdates.questions = updatedQuestions;
      }
      
      // 3. Save the template
      if (Object.keys(templateUpdates).length > 0) {
        console.log('💾 Updating template with:', templateUpdates);
        await updateTemplate(currentTemplate.id, templateUpdates);
        
        // Update local state to reflect saved changes
        if (templateUpdates.name || templateUpdates.questions) {
          const updatedTemplate = {
            ...currentTemplate,
            ...templateUpdates,
            updatedAt: new Date().toISOString()
          };
          setCurrentTemplate(updatedTemplate);
        }
      }
      
      // 4. Clear all pending changes
      clearAllChanges();
      setPendingChangesCount(0);
      
      console.log('✅ Save operation completed successfully');
    } catch (error) {
      console.error('❌ Failed to save changes:', error);
      throw error;
    }
  }, [currentTemplate, updateTemplate, generateDefaultLabels, setPendingChangesCount, setCurrentTemplate, clearAllChanges]);
  
  // Memoized pending changes count
  const pendingChangesCount = useMemo(() => {
    return uiState.pendingChanges.size + 
           (uiState.hasTitleChanges ? 1 : 0) + 
           (uiState.hasScaleChanges ? 1 : 0) + 
           uiState.deletedQuestions.size;
  }, [uiState.pendingChanges.size, uiState.hasTitleChanges, uiState.hasScaleChanges, uiState.deletedQuestions.size]);
  
  // Update pending changes count in store
  useEffect(() => {
    setPendingChangesCount(pendingChangesCount);
  }, [pendingChangesCount, setPendingChangesCount]);

  // Consolidated template initialization and loading
  useEffect(() => {
    const initializeAndLoadTemplates = async () => {
      try {
        // Load templates from file storage
        await loadTemplates();
        
        // Initialize default template if needed
        if (!templateId && templates.length === 0) {
          await initializeTemplate();
        }
      } catch (error) {
        console.error('Failed to load/initialize templates:', error);
      }
    };
    
    initializeAndLoadTemplates();
  }, [loadTemplates, initializeTemplate, templateId, templates.length]);

  // Handle template selection and state synchronization
  useEffect(() => {
    if (currentTemplate) {
      // Reset UI state when template changes
      setUiState(prev => ({
        ...prev,
        localTitle: currentTemplate.name,
        globalScale: currentTemplate.questions[0]?.scale || 7,
        hasTitleChanges: false,
        hasScaleChanges: false,
        deletedQuestions: new Set()
      }));
      
      // Set up save handler
      setSaveHandler(saveAllChanges);
    }
  }, [currentTemplate?.id, setSaveHandler, saveAllChanges]);

  // Handle template selection by ID
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCurrentTemplate(template);
      } else {
        console.warn('Template not found for ID:', templateId);
      }
    }
  }, [templateId, templates, setCurrentTemplate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSaveHandler();
      setPendingChangesCount(0);
    };
  }, [clearSaveHandler, setPendingChangesCount]);

  // Handle template creation
  const handleCreateTemplate = async () => {
    if (!uiState.newTemplateName.trim()) return;
    
    try {
      const newTemplate = await createTemplate(uiState.newTemplateName.trim());
      updateUiState({ newTemplateName: '', isCreatingTemplate: false });
      // Navigate to the new template
      navigate(`/survey-template/${newTemplate.id}`);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Handle global scale change
  const handleGlobalScaleChange = useCallback((newScale: number) => {
    console.log('🔄 Scale change requested:', { from: uiState.globalScale, to: newScale });
    
    updateUiState({
      globalScale: newScale,
      hasScaleChanges: true
    });
    
    console.log('✅ Scale changes marked as pending');
    
    // Don't update currentTemplate immediately - let the save function handle it
    // This prevents the useEffect from resetting hasScaleChanges
  }, [uiState.globalScale, updateUiState]);

  // Handle question creation
  const handleAddQuestion = useCallback(async () => {
    if (!currentTemplate) return;

    try {
      const defaultLabels = generateDefaultLabels(uiState.globalScale);
      const newQuestion = {
        text: 'New question',
        scale: uiState.globalScale,
        labels: defaultLabels
      };
      await addQuestion(currentTemplate.id, newQuestion);
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  }, [currentTemplate, uiState.globalScale, addQuestion, generateDefaultLabels]);

  // Handle question update - now just tracks changes for batch saving
  const handleUpdateQuestion = useCallback(async (questionId: string, questionData: Partial<SurveyQuestion>) => {
    if (!currentTemplate) return;

    // Just track the changes - they will be saved when user clicks "Save Changes"
    updatePendingChanges(questionId, questionData);
  }, [currentTemplate, updatePendingChanges]);

  // Handle question deletion
  const handleDeleteQuestion = useCallback((questionId: string) => {
    if (!currentTemplate) return;

    // Check if this would be the last question
    const remainingQuestions = currentTemplate.questions.filter(q => !uiState.deletedQuestions.has(q.id));
    if (remainingQuestions.length <= 1) {
      alert('Cannot delete the last question');
      return;
    }

    if (window.confirm('Are you sure you want to delete this question?')) {
      // Add to deleted questions set and remove from pending changes
      const newDeletedQuestions = new Set([...uiState.deletedQuestions, questionId]);
      const newPendingChanges = new Map(uiState.pendingChanges);
      newPendingChanges.delete(questionId);
      
      updateUiState({
        deletedQuestions: newDeletedQuestions,
        pendingChanges: newPendingChanges
      });
    }
  }, [currentTemplate, uiState.deletedQuestions, uiState.pendingChanges, updateUiState]);

  // Handle immediate title change for local state
  const handleTitleChange = useCallback((newTitle: string) => {
    console.log('📝 handleTitleChange called:', { newTitle, currentTitle: currentTemplate?.name });
    
    const hasChanges = newTitle !== currentTemplate?.name;
    updateUiState({
      localTitle: newTitle,
      hasTitleChanges: hasChanges
    });
    
    console.log('📝 Title change tracked:', { hasChanges, newTitle, currentTitle: currentTemplate?.name });
  }, [currentTemplate?.name, updateUiState]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading survey questions...</div>
      </div>
    );
  }

  // If no template ID and no current template, show template creation
  if (!templateId && !currentTemplate) {
    return (
      <TemplateCreationForm
        newTemplateName={uiState.newTemplateName}
        onNameChange={(name) => updateUiState({ newTemplateName: name })}
        onSubmit={handleCreateTemplate}
        onCancel={() => navigate('/survey-templates')}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 h-screen overflow-y-auto pb-40">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-error/80">{error}</div>
            <button
              onClick={clearError}
              className="text-error hover:text-error/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}





      {/* Survey Header */}
      {currentTemplate && (
        <>
          <SurveyHeader
            template={{ ...currentTemplate, name: uiState.localTitle }}
            globalScale={uiState.globalScale}
            onScaleChange={handleGlobalScaleChange}
            onAddQuestion={handleAddQuestion}
            onTitleChange={handleTitleChange}
          />

          {/* Questions Display */}
          <div className="space-y-4">
            {currentTemplate.questions
              .filter(question => !uiState.deletedQuestions.has(question.id))
              .map((question, index) => {
                // Use the new scale from uiState if there are scale changes, otherwise use the question's scale
                const questionWithUpdatedScale = uiState.hasScaleChanges ? {
                  ...question,
                  scale: uiState.globalScale,
                  labels: generateDefaultLabels(uiState.globalScale)
                } : question;
                
                return (
                  <EditableQuestionCard
                    key={`${question.id}-${uiState.globalScale}`}
                    question={questionWithUpdatedScale}
                    index={index}
                    globalScale={uiState.globalScale}
                    onSave={(questionData) => handleUpdateQuestion(question.id, questionData)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                    onTrackChanges={(questionData) => updatePendingChanges(question.id, questionData)}
                  />
                );
              })}
          </div>
        </>
      )}

      {/* No Template Selected */}
      {!currentTemplate && templates.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Template not found or not loaded.</p>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestionsPage;
