import React from 'react';
import { SurveyTemplate } from '../../types/survey';

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Your OpenAI API key (stored locally)</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Model selection</label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
          <option value="gpt-4">GPT-4 (More Accurate)</option>
          <option value="gpt-4o">GPT-4o (Balanced)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Choose based on accuracy vs. cost</p>
      </div>

      <div className="pt-2">
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
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Using '{currentTemplate.name}'</h4>
          <div className="text-xs text-gray-600">
            {currentTemplate.questions.length} questions, {currentTemplate.questions[0]?.scale || 7}-point scale
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfigurationPanel;
