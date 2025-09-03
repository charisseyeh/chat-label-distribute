import React, { useState, useEffect } from 'react';

interface PromptReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSavePrompt: (editedPrompt: string) => void;
}

const PromptReviewModal: React.FC<PromptReviewModalProps> = ({
  isOpen,
  onClose,
  currentPrompt,
  onSavePrompt
}) => {
  const [editablePrompt, setEditablePrompt] = useState<string>('');

  // Update editable prompt when currentPrompt changes
  useEffect(() => {
    setEditablePrompt(currentPrompt);
  }, [currentPrompt]);

  const handleSave = () => {
    onSavePrompt(editablePrompt);
    onClose();
  };

  const handleReset = () => {
    setEditablePrompt(currentPrompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-h3">System prompt to OpenAI</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
          >
            ×
          </button>
        </div>
        


        {/* Editable Prompt */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt (editable):
          </label>
          <textarea
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            placeholder="Enter your custom prompt here..."
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-md"
          >
            Reset to Original
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptReviewModal;
