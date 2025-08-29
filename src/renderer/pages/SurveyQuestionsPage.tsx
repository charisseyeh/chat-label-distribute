import React, { useState, useEffect, useCallback } from 'react';
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
    loadTemplate
  } = useSurveyQuestions();

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [globalScale, setGlobalScale] = useState<number>(7);

  // Simple pending changes implementation without the problematic hook
  const [pendingChanges, setPendingChanges] = useState<Map<string, Partial<SurveyQuestion>>>(new Map());
  
  // Set up save handler for the footer
  const { setSaveHandler, clearSaveHandler, setPendingChangesCount } = usePageActionsStore();
  
  // Memoize the save function
  const saveAllChanges = useCallback(async () => {
    if (!currentTemplate || pendingChanges.size === 0) return;
    
    try {
      console.log('💾 Saving all pending changes...');
      const updatePromises = Array.from(pendingChanges.entries()).map(([questionId, questionData]) => 
        updateQuestion(currentTemplate.id, questionId, questionData)
      );
      
      await Promise.all(updatePromises);
      setPendingChanges(new Map());
      console.log('✅ All changes saved successfully');
    } catch (error) {
      console.error('❌ Failed to save changes:', error);
    }
  }, [currentTemplate, pendingChanges, updateQuestion]);
  
  // Set up save handler when template changes
  useEffect(() => {
    if (currentTemplate) {
      console.log('🔧 Setting up save handler for template:', currentTemplate.id);
      setSaveHandler(saveAllChanges);
    }
    
    return () => {
      // Don't clear the save handler on cleanup - let it persist
      console.log('🧹 Component unmounting, but keeping save handler');
    };
  }, [currentTemplate?.id, saveAllChanges, setSaveHandler]);
  
  // Only clear save handler when component actually unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, clearing save handler');
      clearSaveHandler();
      setPendingChangesCount(0);
    };
  }, [clearSaveHandler, setPendingChangesCount]);
  
  // Debug: Log when pending changes change
  useEffect(() => {
    console.log('📝 Pending changes updated:', pendingChanges.size, 'changes');
    if (pendingChanges.size > 0) {
      console.log('📋 Pending changes:', Array.from(pendingChanges.keys()));
    }
  }, [pendingChanges]);
  
  // Sync pending changes count
  useEffect(() => {
    console.log('🔄 Syncing pending changes count:', pendingChanges.size);
    setPendingChangesCount(pendingChanges.size);
  }, [pendingChanges.size, setPendingChangesCount]);
  
  // Debug: Log when save handler changes
  useEffect(() => {
    console.log('🔧 Save handler updated, pending changes:', pendingChanges.size);
  }, [saveAllChanges, pendingChanges.size]);

  // Load templates from file storage on mount
  useEffect(() => {
    const loadTemplatesOnMount = async () => {
      try {
        console.log('🚀 Loading templates from file storage...');
        await loadTemplates();
        console.log('✅ Templates loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load templates:', error);
      }
    };
    
    loadTemplatesOnMount();
  }, [loadTemplates]);

  // Initialize default template on mount if no template ID
  useEffect(() => {
    const initTemplate = async () => {
      if (!templateId && templates.length === 0) {
        console.log('📝 No templates found, initializing default template...');
        try {
          await initializeTemplate();
          console.log('✅ Default template initialized');
        } catch (error) {
          console.error('❌ Failed to initialize default template:', error);
        }
      }
    };
    
    initTemplate();
  }, [templateId, templates.length, initializeTemplate]);

  // Set current template when templateId changes or templates load
  useEffect(() => {
    console.log('🔄 Template loading effect triggered:', { templateId, templatesLength: templates.length });
    
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        console.log('📋 Setting current template:', template.name);
        setCurrentTemplate(template);
        // Set global scale from the first question or default to 7
        const scale = template.questions[0]?.scale || 7;
        setGlobalScale(scale);
        console.log('📏 Set global scale to:', scale);
      } else {
        console.log('❌ Template not found for ID:', templateId);
        console.log('📋 Available templates:', templates.map(t => ({ id: t.id, name: t.name })));
      }
    } else if (templateId && templates.length === 0) {
      console.log('⏳ Template ID exists but no templates loaded yet');
    } else if (!templateId) {
      console.log('📝 No template ID provided');
    }
  }, [templateId, templates, setCurrentTemplate]);
  
  // Also handle the case where templates are loaded after the component mounts
  useEffect(() => {
    if (templateId && templates.length > 0 && !currentTemplate) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        console.log('🔄 Loading template after templates loaded:', template.name);
        setCurrentTemplate(template);
        const scale = template.questions[0]?.scale || 7;
        setGlobalScale(scale);
      }
    }
  }, [templateId, templates, currentTemplate, setCurrentTemplate]);

  // Handle template creation
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      const newTemplate = await createTemplate(newTemplateName.trim());
      setNewTemplateName('');
      setIsCreatingTemplate(false);
      // Navigate to the new template
      navigate(`/survey-template/${newTemplate.id}`);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Handle global scale change
  const handleGlobalScaleChange = async (newScale: number) => {
    console.log(`🌍 Global scale change: ${globalScale} -> ${newScale}`);
    setGlobalScale(newScale);
    
    // Update all questions with the new scale and default labels
    if (currentTemplate) {
      const defaultLabels = generateDefaultLabels(newScale);
      console.log(`📝 Generated new labels for scale ${newScale}:`, defaultLabels);
      
      const updatedQuestions = currentTemplate.questions.map(question => ({
        ...question,
        scale: newScale,
        labels: defaultLabels
      }));
      
      // Update the template with new questions
      try {
        await updateTemplate(currentTemplate.id, { questions: updatedQuestions });
        console.log(`💾 Template updated successfully with new scale ${newScale}`);
        
        // Update local state immediately so components can react to the change
        const updatedTemplate = {
          ...currentTemplate,
          questions: updatedQuestions
        };
        setCurrentTemplate(updatedTemplate);
        
        // Clear any pending changes since the scale change resets everything
        setPendingChanges(new Map());
        
        // This will trigger a re-render and the EditableQuestionCard components will sync
        // their formData with the new scale and labels
      } catch (error) {
        console.error('Failed to update template scale:', error);
      }
    }
  };

  // Handle question creation
  const handleAddQuestion = async () => {
    if (!currentTemplate) return;

    try {
      const newQuestion = {
        text: 'New question',
        scale: 7,
        labels: { 1: 'Very Low', 2: 'Low', 3: 'Somewhat Low', 4: 'Neutral', 5: 'Somewhat High', 6: 'High', 7: 'Very High' }
      };
      await addQuestion(currentTemplate.id, newQuestion);
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  // Handle question update
  const handleUpdateQuestion = async (questionId: string, questionData: Partial<SurveyQuestion>) => {
    if (!currentTemplate) return;

    try {
      await updateQuestion(currentTemplate.id, questionId, questionData);
      // Remove from pending changes after successful save
      const newPendingChanges = new Map(pendingChanges);
      newPendingChanges.delete(questionId);
      setPendingChanges(newPendingChanges);
    } catch (error) {
      console.error('❌ Failed to update question:', error);
    }
  };

  // Track changes in a question
  const trackQuestionChanges = (questionId: string, questionData: Partial<SurveyQuestion>) => {
    console.log('📝 Tracking changes for question:', questionId, questionData);
    const newPendingChanges = new Map(pendingChanges);
    newPendingChanges.set(questionId, questionData);
    setPendingChanges(newPendingChanges);
    console.log('📊 Total pending changes:', newPendingChanges.size);
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentTemplate) return;

    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(currentTemplate.id, questionId);
        // Remove from pending changes if it was there
        const newPendingChanges = new Map(pendingChanges);
        newPendingChanges.delete(questionId);
        setPendingChanges(newPendingChanges);
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  const handleTitleChange = useCallback(async (newTitle: string) => {
    if (!currentTemplate || newTitle === currentTemplate.name) return;
    
    try {
      await updateTemplate(currentTemplate.id, { name: newTitle });
      // Silent success - no console log needed
    } catch (error) {
      // Silent error handling - no console log needed
    }
  }, [currentTemplate, updateTemplate]);


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
        newTemplateName={newTemplateName}
        onNameChange={setNewTemplateName}
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
            template={currentTemplate}
            globalScale={globalScale}
            onScaleChange={handleGlobalScaleChange}
            onAddQuestion={handleAddQuestion}
            onTitleChange={handleTitleChange}
          />

          {/* Questions Display */}
          <div className="space-y-4">
            {currentTemplate.questions.map((question, index) => (
              <EditableQuestionCard
                key={`${question.id}-${globalScale}`}
                question={question}
                index={index}
                globalScale={globalScale}
                onSave={(questionData) => handleUpdateQuestion(question.id, questionData)}
                onDelete={() => handleDeleteQuestion(question.id)}
                onTrackChanges={(questionData) => trackQuestionChanges(question.id, questionData)}
              />
            ))}
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
