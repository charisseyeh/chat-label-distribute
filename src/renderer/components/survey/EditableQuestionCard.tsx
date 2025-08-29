import React, { useState, useEffect } from 'react';
import { SurveyQuestion } from '../../types/survey';
import { generateDefaultLabels } from '../../utils/surveyUtils';

interface EditableQuestionCardProps {
  question: SurveyQuestion;
  index: number;
  globalScale: number;
  onSave: (questionData: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  onTrackChanges: (questionData: Partial<SurveyQuestion>) => void;
}

const EditableQuestionCard: React.FC<EditableQuestionCardProps> = ({ 
  question, 
  index, 
  globalScale,
  onSave, 
  onDelete,
  onTrackChanges
}) => {
  const [formData, setFormData] = useState({
    text: question.text,
    scale: question.scale,
    labels: { ...question.labels }
  });

  // Use global scale for rendering, but keep local scale for tracking changes
  const displayScale = globalScale;

  // Sync local formData with question prop changes (especially when scale changes)
  useEffect(() => {
    // Always sync when scale changes to ensure consistency
    if (formData.scale !== question.scale || 
        JSON.stringify(formData.labels) !== JSON.stringify(question.labels) ||
        formData.text !== question.text) {
      
      // Generate new labels if scale changed
      let newLabels = { ...question.labels };
      if (formData.scale !== question.scale) {
        newLabels = generateDefaultLabels(question.scale);
      }
      
      setFormData({
        text: question.text,
        scale: question.scale,
        labels: newLabels
      });
    }
  }, [question.scale, question.labels, question.text]); // Remove formData.scale to prevent infinite loops

  // Handle global scale changes separately
  useEffect(() => {
    // Only update if the display scale is different from the current form data scale
    // and if the question scale has actually changed
    if (displayScale !== question.scale) {
      // Generate new labels for the new scale
      const newLabels = generateDefaultLabels(displayScale);
      setFormData(prev => ({
        ...prev,
        scale: displayScale,
        labels: newLabels
      }));
    }
  }, [displayScale, question.scale]); // Only depend on displayScale and question.scale, not formData.scale



  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onTrackChanges(newFormData);
  };

  const handleLabelChange = (rating: number, value: string) => {
    const newLabels = { ...formData.labels, [rating]: value };
    const newFormData = { ...formData, labels: newLabels };
    setFormData(newFormData);
    onTrackChanges(newFormData);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ borderRadius: 'var(--radius-md)'}}>
      <div>
        {/* Question Header */}
        <div className="flex items-start px-3">
          <h3 className="text-sm text-gray-500 pt-3 pb-0">
            Question {index + 1}
          </h3>
        </div>

        {/* Question Text */}
        <div className="border-b border-border pb-3">
          <input
            type="text"
            value={formData.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="Enter your question here..."
            className="w-full px-3 py-0 border-0 focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Labels */}
        <div className="px-3">
          <div className="space-y-1">
            {Array.from({ length: displayScale }, (_, i) => i + 1).map((rating) => (
              <div key={rating} className={`flex items-center ${rating < displayScale ? 'border-b border-border' : ''}`}>
                <div className="w-6 h-6 border border-border rounded-full flex items-center justify-center text-sm text-muted-foreground flex-shrink-0">
                  {rating}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.labels[rating] || ''}
                    onChange={(e) => handleLabelChange(rating, e.target.value)}
                    className="w-full px-3 py-2 border-0 focus:ring-0 focus:outline-none"
                    placeholder={`Label for rating ${rating}`}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Delete Question Button */}
        <div className="bg-red-400/10 hover:bg-red-600/30">
          <button
            type="button"
            onClick={onDelete}
            className="w-full py-2 px-4 text-red-600 hover:text-red-700 transition-colors text-left"
          >
            Delete question
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableQuestionCard;
