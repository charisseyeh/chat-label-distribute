import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/useSurveyQuestions';
import { SurveyTemplate } from '../types/survey';

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

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const navigate = useNavigate();

  // Initialize default template on mount
  useEffect(() => {
    initializeTemplate();
  }, [initializeTemplate]);

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

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  // Navigate to template
  const handleTemplateClick = (template: SurveyTemplate) => {
    navigate(`/survey-template/${template.id}`);
  };

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

      {/* Templates List */}
      <div className="space-y-6">
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
          templates.map((template) => (
            <div
              key={template.id}
              className="p-6 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{template.questions.length} questions</span>
                    <span>•</span>
                    <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                    {template.updatedAt !== template.createdAt && (
                      <>
                        <span>•</span>
                        <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Categories: </span>
                    {Array.from(new Set(template.questions.map(q => q.category))).join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateClick(template);
                    }}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit Template
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SurveyTemplatesPage;
