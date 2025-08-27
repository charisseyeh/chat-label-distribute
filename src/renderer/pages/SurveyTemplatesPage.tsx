import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/useSurveyQuestions';
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

  // Set current template ID if there's only one template and none is currently selected
  useEffect(() => {
    if (templates.length === 1 && !currentTemplateId) {
      setCurrentTemplateId(templates[0].id);
    }
  }, [templates, currentTemplateId, setCurrentTemplateId]);

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
      selected: isCurrentlyUsing
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Templates</h1>
        <p className="text-gray-600">
          Create and manage survey question templates for psychological assessment of conversations.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-red-800">{error}</div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Create Template Button */}
      <div className="mb-8">
        <button
          onClick={() => setIsCreatingTemplate(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Template
        </button>
      </div>

      {/* Create Template Form */}
      {isCreatingTemplate && (
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Enter template name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Template
            </button>
            <button
              onClick={() => {
                setIsCreatingTemplate(false);
                setNewTemplateName('');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates List using Design System */}
      {templates.length === 0 && !isCreatingTemplate ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No survey templates found.</p>
          <button
            onClick={() => setIsCreatingTemplate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <List
            variant="with-dividers"
            listItemVariant="double-chip"
            items={listItems}
            className="bg-white"
          />
          
          {/* Create New Template Button at bottom */}
          <div className="p-4 bg-orange-50 border-t border-orange-200">
            <button
              onClick={() => {
                setIsCreatingTemplate(true);
                setNewTemplateName('');
              }}
              className="w-full text-center text-orange-700 hover:text-orange-800 font-medium py-3 px-4 rounded-lg transition-colors"
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
