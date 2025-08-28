import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/survey/useSurveyQuestions';
import { useSurveyQuestionStore } from '../stores/surveyQuestionStore';
import { SurveyTemplate, SurveyQuestion } from '../types/survey';
import { QuestionScale } from '../types/question';
import { ListItem, List, Chip } from '../components/common';
import { FloatingLabelInput, FloatingLabelSelect, FloatingLabelTextarea } from '../components/common/molecules/label';

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Survey Template</h1>
          <p className="text-muted-foreground">
            Create a new survey question template for psychological assessment of conversations.
          </p>
        </div>

        {/* Create Template Form */}
        <div className="p-6 bg-muted border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">New Template</h3>
          <div className="flex items-center space-x-4">
            <FloatingLabelInput
              label="Template Name"
              value={newTemplateName}
              onChange={setNewTemplateName}
              placeholder="Enter template name..."
              className="flex-1"
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
    <div className="max-w-6xl mx-auto p-6">
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
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FloatingLabelInput
              label="Title"
              value={currentTemplate.name}
              onChange={(value) => {
                // Handle title update if needed
              }}
              placeholder="Survey title"
              className="w-full"
            />
            <FloatingLabelSelect
              label="Scale"
              value={currentTemplate.questions[0]?.scale?.toString() || "7"}
              onChange={(value) => {
                // Handle scale update if needed
              }}
              options={[
                { value: "2", label: "2 point scale" },
                { value: "3", label: "3 point scale" },
                { value: "5", label: "5 point scale" },
                { value: "7", label: "7 point scale" },
                { value: "10", label: "10 point scale" }
              ]}
              className="w-full"
            />
          </div>

          {/* Add Question Button */}
          <div className="mb-8">
            <button
              onClick={() => setIsEditingQuestion(true)}
              className="w-full py-4 px-6 bg-orange-100 border-2 border-orange-300 border-dashed rounded-lg text-orange-700 hover:bg-orange-200 transition-colors font-medium"
            >
              + Add new question
            </button>
          </div>

          {/* Questions Display */}
          <div className="space-y-6">
            {currentTemplate.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onEdit={() => {
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
          <p className="text-muted-foreground">Template not found or not loaded.</p>
          <button
            onClick={() => navigate('/survey-templates')}
            className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Templates
          </button>
        </div>
      )}
    </div>
  );
};

// Question Card Component
interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Question {index + 1}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4">{question.text}</p>
      
      <div className="space-y-3">
        {Object.entries(question.labels).map(([rating, label]) => (
          <div key={rating} className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
              {rating}
            </div>
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
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
    scale: question?.scale || 7,
    labels: question?.labels || { 1: 'Very Low', 2: 'Low', 3: 'Somewhat Low', 4: 'Neutral', 5: 'Somewhat High', 6: 'High', 7: 'Very High' }
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
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {question ? 'Edit Question' : 'Add New Question'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text */}
          <FloatingLabelTextarea
            label="Question Text"
            value={formData.text}
            onChange={(value) => setFormData(prev => ({ ...prev, text: value }))}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full"
          />

          {/* Scale Selection */}
          <FloatingLabelSelect
            label="Rating Scale"
            value={formData.scale.toString()}
            onChange={(value) => handleScaleChange(Number(value))}
            options={[
              { value: "2", label: "2-point scale" },
              { value: "3", label: "3-point scale" },
              { value: "5", label: "5-point scale" },
              { value: "7", label: "7-point scale" },
              { value: "10", label: "10-point scale" }
            ]}
            className="w-full"
          />

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rating Labels
            </label>
            <div className="space-y-2">
              {Array.from({ length: formData.scale }, (_, i) => i + 1).map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="w-8 text-sm font-medium text-foreground">{rating}</span>
                  <FloatingLabelInput
                    label={`Label for rating ${rating}`}
                    value={formData.labels[rating] || ''}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      labels: { ...prev.labels, [rating]: value }
                    }))}
                    placeholder={`Label for rating ${rating}`}
                    className="flex-1"
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
              className="px-4 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-secondary-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
