import React from 'react';
import { AssessmentTemplate } from '../../types/assessment';
import { FloatingLabelInput, FloatingLabelSelect } from '../common/molecules/label';

interface AssessmentHeaderProps {
  template: AssessmentTemplate;
  globalScale: number;
  onScaleChange: (scale: number) => void;
  onAddQuestion: () => void;
  onTitleChange: (newTitle: string) => void;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  template,
  globalScale,
  onScaleChange,
  onAddQuestion,
  onTitleChange
}) => {
  return (
    <div >
      <div className="flex flex-col gap-0 mb-4 border border-border" style={{ borderRadius: 'var(--radius-md)' }}>
        <FloatingLabelInput
          label="Title"
          value={template.name}
          onChange={onTitleChange}
          placeholder="Assessment title"
          className="w-full border-b border-border hover:bg-gray-50 focus-within:bg-white transition-colors"
          noBorder={true}
        />
        <FloatingLabelSelect
          label="Scale"
          value={globalScale.toString()}
          onChange={(value) => onScaleChange(Number(value))}
          options={[
            { value: "2", label: "2 point scale" },
            { value: "3", label: "3 point scale" },
            { value: "5", label: "5 point scale" },
            { value: "7", label: "7 point scale" },
            { value: "10", label: "10 point scale" }
          ]}
          className="w-full"
          noBorder={true}
        />
      </div>

      <div className="mb-4 container-create">
        <button
          onClick={onAddQuestion}
          className="btn-unstyled"
        >
          + Add new question
        </button>
      </div>
    </div>
  );
};

export default AssessmentHeader;
