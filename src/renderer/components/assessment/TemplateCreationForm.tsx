import React from 'react';
import { FloatingLabelInput } from '../common/molecules/label';

interface TemplateCreationFormProps {
  newTemplateName: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TemplateCreationForm: React.FC<TemplateCreationFormProps> = ({
  newTemplateName,
  onNameChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Assessment Template</h1>
        <p className="text-muted-foreground">
          Create a new assessment question template for psychological assessment of conversations.
        </p>
      </div>

      <div className="container-muted">
        <h3 className="text-lg font-semibold text-foreground mb-4">New Template</h3>
        <div className="flex items-center space-x-4">
          <FloatingLabelInput
            label="Template Name"
            value={newTemplateName}
            onChange={onNameChange}
            placeholder="Enter template name..."
            className="flex-1"
          />
          <button
            onClick={onSubmit}
            disabled={!newTemplateName.trim()}
            className="btn-success btn-lg"
          >
            Create Template
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary btn-lg"
          >
            Back to Templates
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreationForm;
