import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/survey/useSurveyQuestions';
import { SurveyTemplate } from '../types/survey';
import { List, ListItem } from '../components/common';
import { useNavigationStore } from '../stores/navigationStore';

const SurveyTemplatesPage: React.FC = () => {
  const {
    templates,
    loading,
    error,
    createTemplate,
    deleteTemplate,
    initializeTemplate,
    clearError
  } = useSurveyQuestions();

  const { currentTemplateId, setCurrentTemplateId } = useNavigationStore();
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const navigate = useNavigate();

  // Initialize default template on mount
  useEffect(() => {
    initializeTemplate();
  }, [initializeTemplate]);

  // Note: Removed automatic template selection to allow proper navigation highlighting
  // Users must explicitly click on a template to navigate to it

  // Handle template creation
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      const newTemplate = await createTemplate(newTemplateName.trim());
      setNewTemplateName('');
      setIsCreatingTemplate(false);
      // Set as current template and navigate to it
      setCurrentTemplateId(newTemplate.id);
      navigate(`/survey-template/${newTemplate.id}`);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteTemplate(templateId);
        // Clear current template ID if we deleted the active template
        if (currentTemplateId === templateId) {
          setCurrentTemplateId(null);
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  // Navigate to template
  const handleTemplateClick = (template: SurveyTemplate) => {
    setCurrentTemplateId(template.id);
    navigate(`/survey-template/${template.id}`);
  };

  // Prepare list items data for the design system
  const listItems = templates.map((template) => {
    const metadata = [
      `${template.questions.length} questions • Created ${new Date(template.createdAt).toLocaleDateString()}`
    ];

    // Add updated date if different from creation date
    if (template.updatedAt !== template.createdAt) {
      metadata[0] += ` • Updated ${new Date(template.updatedAt).toLocaleDateString()}`;
    }

    const isCurrentlyUsing = currentTemplateId === template.id;

    return {
      title: template.name,
      metadata,
      chip: isCurrentlyUsing ? {
        variant: 'currently-using' as const,
        text: 'currently using'
      } : undefined,
      onClick: () => handleTemplateClick(template),
      onDelete: () => handleDeleteTemplate(template.id),
      selected: false // Don't highlight the currently using template with background color
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading survey templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

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


      {/* Create Template Form */}
      {isCreatingTemplate && (
        <div className="mb-8 p-6 bg-muted border border-border rounded-lg">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Create New Template</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Enter template name..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <button
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
              className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Template
            </button>
            <button
              onClick={() => {
                setIsCreatingTemplate(false);
                setNewTemplateName('');
              }}
              className="px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates List using Design System */}
      {templates.length === 0 && !isCreatingTemplate ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No survey templates found.</p>
          <button
            onClick={() => setIsCreatingTemplate(true)}
                          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <List
            variant="with-dividers"
            listItemVariant="double"
            items={listItems}
            className="bg-white"
          />
          
          {/* Create New Template Button at bottom */}
          <div className="p-4 bg-warning/10 border-t border-warning/20">
            <button
              onClick={() => {
                setIsCreatingTemplate(true);
                setNewTemplateName('');
              }}
              className="w-full text-center text-warning/80 hover:text-warning font-medium py-3 px-4 rounded-lg transition-colors"
            >
              + Create new template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyTemplatesPage;
