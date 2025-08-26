import React, { useEffect, useState } from 'react';
import { useSurveyQuestions } from '../hooks/useSurveyQuestions';
import { SurveyTemplate, SurveyQuestion } from '../types/survey';
import { QuestionCategory, QuestionScale } from '../types/question';

const SurveyQuestionsPage: React.FC = () => {
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

  // Initialize default template on mount
  useEffect(() => {
    initializeTemplate();
  }, [initializeTemplate]);

  // Handle template creation
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      await createTemplate(newTemplateName.trim());
      setNewTemplateName('');
      setIsCreatingTemplate(false);
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Questions</h1>
        <p className="text-gray-600">
          Create and manage survey questions for psychological assessment of conversations.
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

      {/* Template Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Survey Templates</h2>
          <button
            onClick={() => setIsCreatingTemplate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Template
          </button>
        </div>

        {/* Create Template Form */}
        {isCreatingTemplate && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingTemplate(false);
                  setNewTemplateName('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Template List */}
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                currentTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setCurrentTemplate(template)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600">
                    {template.questions.length} questions • Created {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Management */}
      {currentTemplate && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions for: {currentTemplate.name}
            </h2>
            <button
              onClick={() => setIsEditingQuestion(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Question
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {currentTemplate.questions.map((question, index) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{question.scale}-point scale</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{question.text}</h4>
                    <div className="text-sm text-gray-600">
                      <strong>Labels:</strong> {Object.entries(question.labels)
                        .map(([rating, label]) => `${rating}=${label}`)
                        .join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingQuestion(question);
                        setIsEditingQuestion(true);
                      }}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
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
          <p className="text-gray-600">Select a template to manage its questions.</p>
        </div>
      )}

      {/* No Templates */}
      {templates.length === 0 && !isCreatingTemplate && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No survey templates found.</p>
          <button
            onClick={() => setIsCreatingTemplate(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
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
    category: question?.category || 'custom' as QuestionCategory,
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as QuestionCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mood">Mood</option>
              <option value="emotional">Emotional</option>
              <option value="stress">Stress</option>
              <option value="energy">Energy</option>
              <option value="wellbeing">Wellbeing</option>
              <option value="custom">Custom</option>
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
