import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentQuestions } from '../hooks/assessment/useAssessmentQuestions';
import { useTemplateSwitching } from '../hooks/assessment/useTemplateSwitching';
import { AssessmentTemplate } from '../types/assessment';
import { List, ListItem } from '../components/common';
import { useNavigationStore } from '../stores/navigationStore';

const AssessmentTemplatesPage: React.FC = () => {
  const {
    templates,
    loading,
    error,
    createTemplate,
    deleteTemplate,
    initializeTemplate,
    clearError
  } = useAssessmentQuestions();

  const { currentTemplateId, setCurrentTemplateId } = useNavigationStore();
  const { switchTemplateSafely } = useTemplateSwitching();
  const navigate = useNavigate();

  // Initialize default template on mount
  useEffect(() => {
    initializeTemplate();
  }, [initializeTemplate]);

  // Note: Removed automatic template selection to allow proper navigation highlighting
  // Users must explicitly click on a template to navigate to it

  // Handle template creation
  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await createTemplate('Untitled Template');
      // Set as current template and navigate to it
      setCurrentTemplateId(newTemplate.id);
      navigate(`/assessment-template/${newTemplate.id}`);
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

  // Switch template without navigation
  const handleTemplateClick = (template: AssessmentTemplate) => {
    switchTemplateSafely(
      template,
      () => {
        // Success callback - template switched successfully
        // Template switch completed silently
      },
      () => {
        // Cancel callback - user cancelled the switch
        console.log('Template switch cancelled by user');
      }
    );
  };

  // Navigate to template editing page on double-click
  const handleTemplateDoubleClick = (template: AssessmentTemplate) => {
    navigate(`/assessment-template/${template.id}`);
  };

  // Prepare list items data for the design system
  const listItems = templates.map((template) => {
    // Get the scale from the first question (assuming all questions have the same scale)
    const scale = template.questions.length > 0 ? template.questions[0].scale : 7;
    
    const metadata = [
      `${template.questions.length} questions • ${scale}-point scale • Created ${new Date(template.createdAt).toLocaleDateString()}`
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
      onDoubleClick: () => handleTemplateDoubleClick(template),
      onDelete: () => handleDeleteTemplate(template.id),
      selected: false // Don't highlight the currently using template with background color
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Assessment templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 h-screen overflow-y-auto pb-40">

      {/* Error Display */}
      {error && (
        <div className="mb-6 container-error">
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




      {/* Templates List using Design System */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No Assessment templates found.</p>
          <button
            onClick={handleCreateTemplate}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div 
          className="border border-border overflow-hidden"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <List
            variant="with-dividers"
            listItemVariant="double"
            items={listItems}
            className="bg-white"
          />
          
          {/* Create New Template Button at bottom */}
          <div 
            className="border-t border-primary/20 bg-primary-100 hover:bg-primary-200 transition-colors"
          >
            <button
              onClick={handleCreateTemplate}
              className="w-full text-left text-primary-800 hover:text-primary-900 py-3 px-4 transition-colors"
            >
              + Create new template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTemplatesPage;
