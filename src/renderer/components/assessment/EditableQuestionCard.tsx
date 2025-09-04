import React, { useState, useEffect } from 'react';
import { AssessmentQuestion } from '../../types/assessment';
import { generateDefaultLabels } from '../../utils/assessmentUtils';

interface EditableQuestionCardProps {
  question: AssessmentQuestion;
  index: number;
  globalScale: number;
  onSave: (questionData: Partial<AssessmentQuestion>) => void;
  onDelete: () => void;
  onTrackChanges: (questionData: Partial<AssessmentQuestion>) => void;
}

const EditableQuestionCard: React.FC<EditableQuestionCardProps> = ({ 
  question, 
  index, 
  globalScale,
  onSave, 
  onDelete,
  onTrackChanges
}) => {
  // Initialize form data with current question data - use lazy initialization
  const [formData, setFormData] = useState(() => ({
    text: question.text,
    scale: question.scale,
    labels: { ...question.labels }
  }));

  // Use global scale for rendering
  const displayScale = globalScale;

  // Only update form data when the global scale changes
  useEffect(() => {
    if (displayScale !== formData.scale) {
      const newLabels = generateDefaultLabels(displayScale);
      setFormData(prev => ({
        ...prev,
        scale: displayScale,
        labels: newLabels
      }));
    }
  }, [displayScale]);



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
        <div className="container-destructive">
          <button
            type="button"
            onClick={onDelete}
            className="btn-unstyled"
          >
            Delete question
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableQuestionCard;
