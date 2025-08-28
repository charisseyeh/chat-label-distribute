import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/useSurveyQuestions';
import { SurveyTemplate, SurveyQuestion } from '../types/survey';
import { QuestionScale } from '../types/question';
import { ListItem, List, Chip } from '../components/common';

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
    clearError
  } = useSurveyQuestions();

  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Initialize default template on mount if no template ID
  useEffect(() => {
    if (!templateId) {
      initializeTemplate();
    }
  }, [templateId, initializeTemplate]);

  // Set current template when templateId changes
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setCurrentTemplate(template);
      }
    }
  }, [templateId, templates, setCurrentTemplate]);

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

  // Handle question creation/editing
  const handleSaveQuestion = async (questionData: Partial<SurveyQuestion>) => {
    if (!currentTemplate) return;

    try {
      if (editingQuestion) {
        // Update existing question
        await updateQuestion(currentTemplate.id, editingQuestion.id, questionData);
        setIsEditingQuestion(false);
        setEditingQuestion(null);
      } else {
        // Create new question
        await addQuestion(currentTemplate.id, questionData as Omit<SurveyQuestion, 'id' | 'order'>);
      }
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentTemplate) return;

    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(currentTemplate.id, questionId);
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteTemplate(templateId);
        // Redirect to templates list after deletion
        navigate('/survey-templates');
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Survey Template</h1>
          <p className="text-gray-600">
            Create a new survey question template for psychological assessment of conversations.
          </p>
        </div>

        {/* Create Template Form */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Template</h3>
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
              className="btn-success btn-lg"
            >
              Create Template
            </button>
            <button
              onClick={() => navigate('/survey-templates')}
              className="btn-secondary btn-lg"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with back button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/survey-templates')}
            className="btn-link"
          >
            ← Back to Templates
          </button>
          <button
            onClick={() => handleDeleteTemplate(currentTemplate!.id)}
            className="btn-outline btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete Template
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentTemplate ? currentTemplate.name : 'Survey Questions'}
        </h1>
        <p className="text-gray-600">
          Manage questions for this survey template.
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

      {/* Question Management */}
      {currentTemplate && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions for: {currentTemplate.name}
            </h2>
            <button
              onClick={() => setIsEditingQuestion(true)}
              className="btn-success"
            >
              Add Question
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {currentTemplate.questions.map((question, index) => (
              <ListItem
                key={question.id}
                variant="double"
                title={question.text}
                metadata={[
                  `#${index + 1} • ${question.scale}-point scale`,
                  `Labels: ${Object.entries(question.labels)
                    .map(([rating, label]) => `${rating}=${label}`)
                    .join(', ')}`
                ]}
                onClick={() => {
                  setEditingQuestion(question);
                  setIsEditingQuestion(true);
                }}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Question Editor Modal */}
      {isEditingQuestion && (
        <QuestionEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setIsEditingQuestion(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* No Template Selected */}
      {!currentTemplate && templates.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Template not found or not loaded.</p>
          <button
            onClick={() => navigate('/survey-templates')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Templates
          </button>
        </div>
      )}
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question?: SurveyQuestion | null;
  onSave: (questionData: Partial<SurveyQuestion>) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    text: question?.text || '',
    scale: question?.scale || 5,
    labels: question?.labels || { 1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' }
  });

  const handleScaleChange = (newScale: number) => {
    setFormData(prev => ({
      ...prev,
      scale: newScale,
      labels: generateDefaultLabels(newScale)
    }));
  };

  const generateDefaultLabels = (scale: number): Record<number, string> => {
    const labels: Record<number, string> = {};
    
    if (scale === 2) {
      labels[1] = 'No';
      labels[2] = 'Yes';
    } else if (scale === 3) {
      labels[1] = 'Low';
      labels[2] = 'Medium';
      labels[3] = 'High';
    } else if (scale === 5) {
      labels[1] = 'Very Poor';
      labels[2] = 'Poor';
      labels[3] = 'Average';
      labels[4] = 'Good';
      labels[5] = 'Excellent';
    } else if (scale === 7) {
      labels[1] = 'Very Low';
      labels[2] = 'Low';
      labels[3] = 'Somewhat Low';
      labels[4] = 'Neutral';
      labels[5] = 'Somewhat High';
      labels[6] = 'High';
      labels[7] = 'Very High';
    } else {
      for (let i = 1; i <= scale; i++) {
        labels[i] = i.toString();
      }
    }
    
    return labels;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question ? 'Edit Question' : 'Add New Question'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter your question here..."
              required
            />
          </div>

          {/* Scale Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Scale
            </label>
            <select
              value={formData.scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2-point scale</option>
              <option value={3}>3-point scale</option>
              <option value={5}>5-point scale</option>
              <option value={7}>7-point scale</option>
              <option value={10}>10-point scale</option>
            </select>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Labels
            </label>
            <div className="space-y-2">
              {Array.from({ length: formData.scale }, (_, i) => i + 1).map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="w-8 text-sm font-medium text-gray-700">{rating}</span>
                  <input
                    type="text"
                    value={formData.labels[rating] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      labels: { ...prev.labels, [rating]: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Label for rating ${rating}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {question ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyQuestionsPage;
