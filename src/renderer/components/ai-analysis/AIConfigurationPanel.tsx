import React from 'react';
import { SurveyTemplate } from '../../types/survey';
import { FloatingLabelInput, FloatingLabelSelect } from '../common';

interface AIConfigurationPanelProps {
  apiKey: string;
  model: string;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasSelectedConversations: boolean;
  currentTemplate: SurveyTemplate | null;
  onReviewPrompt: () => void;
}

const AIConfigurationPanel: React.FC<AIConfigurationPanelProps> = ({
  apiKey,
  model,
  onApiKeyChange,
  onModelChange,
  onGenerate,
  isGenerating,
  hasSelectedConversations,
  currentTemplate,
  onReviewPrompt
}) => {
  return (
    <div className="space-y-2">
      <div>
        <FloatingLabelInput
          label="OpenAI API Key"
          value={apiKey}
          onChange={onApiKeyChange}
          type="password"
          placeholder="sk-..."
        />
      </div>
      
      <div>
        <FloatingLabelSelect
          label="AI Model"
          value={model}
          onChange={onModelChange}
          options={[
            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Cheapest)" },
            { value: "gpt-4", label: "GPT-4 (More Accurate)" },
            { value: "gpt-4o", label: "GPT-4o (Balanced)" }
          ]}
        />
      </div>

      <div>
        <button
          onClick={onGenerate}
          disabled={isGenerating || !hasSelectedConversations || !apiKey.trim()}
          className="btn btn-primary btn-md w-full"
        >
          {isGenerating ? 'Generating...' : `Compare ${hasSelectedConversations ? 'conversations' : '0 conversations'}`}
        </button>
      </div>

      {/* Survey Template Display - Compact version */}
      {currentTemplate && (
        <div>
          <span className="text-body-secondary">
            Using "{currentTemplate.name}" {' '}
            <button 
              className="btn btn-link btn-sm"
              onClick={onReviewPrompt}
            >
              Review prompt
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default AIConfigurationPanel;
