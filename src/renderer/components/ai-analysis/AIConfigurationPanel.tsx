import React from 'react';
import { SurveyTemplate } from '../../types/survey';
import { FloatingLabelInput } from '../common/FloatingLabelInput';
import { FloatingLabelSelect } from '../common/FloatingLabelSelect';

interface AIConfigurationPanelProps {
  apiKey: string;
  model: string;
  onApiKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasSelectedConversations: boolean;
  currentTemplate: SurveyTemplate | null;
}

const AIConfigurationPanel: React.FC<AIConfigurationPanelProps> = ({
  apiKey,
  model,
  onApiKeyChange,
  onModelChange,
  onGenerate,
  isGenerating,
  hasSelectedConversations,
  currentTemplate
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
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          {isGenerating ? 'Generating...' : `Compare ${hasSelectedConversations ? 'conversations' : '0 conversations'}`}
        </button>
      </div>

      {/* Survey Template Display - Compact version */}
      {currentTemplate && (
        <div>
          <span className="text-muted-foreground">
            Using "{currentTemplate.name}" {' '}
            <button 
              className="text-blue-600 underline hover:text-blue-800 cursor-pointer text-sm"
              onClick={() => {
                // This could open a modal with full prompt preview
                console.log('Review prompt clicked for template:', currentTemplate.name);
                // You could show this in a modal or tooltip
              }}
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
