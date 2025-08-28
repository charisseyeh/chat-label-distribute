import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyQuestions } from '../hooks/survey/useSurveyQuestions';
import { SurveyTemplate, SurveyQuestion } from '../types/survey';
import { QuestionScale } from '../types/question';
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
    } catch (error) {
      console.error('Failed to update question:', error);
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
    <div className="max-w-6xl mx-auto p-6 h-screen overflow-y-auto">
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
              onClick={handleAddQuestion}
              className="w-full py-4 px-6 bg-orange-100 border-2 border-orange-300 border-dashed rounded-lg text-orange-700 hover:bg-orange-200 transition-colors font-medium"
            >
              + Add new question
            </button>
          </div>

          {/* Questions Display */}
          <div className="space-y-6">
            {currentTemplate.questions.map((question, index) => (
              <EditableQuestionCard
                key={question.id}
                question={question}
                index={index}
                onSave={(questionData) => handleUpdateQuestion(question.id, questionData)}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </div>
        </div>
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

// Editable Question Card Component
interface EditableQuestionCardProps {
  question: SurveyQuestion;
  index: number;
  onSave: (questionData: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
}

const EditableQuestionCard: React.FC<EditableQuestionCardProps> = ({ 
  question, 
  index, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    text: question.text,
    scale: question.scale,
    labels: { ...question.labels }
  });

  const handleScaleChange = (newScale: number) => {
    const labels = generateDefaultLabels(newScale);
    setFormData(prev => ({
      ...prev,
      scale: newScale,
      labels
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-500">
            Question {index + 1}
          </h3>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>

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
          <div className="space-y-3">
            {Array.from({ length: formData.scale }, (_, i) => i + 1).map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                  {rating}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.labels[rating] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      labels: { ...prev.labels, [rating]: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Label for rating ${rating}`}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Delete Question Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onDelete}
            className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Delete question
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyQuestionsPage;
