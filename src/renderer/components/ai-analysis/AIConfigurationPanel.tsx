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
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">OpenAI API Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Your OpenAI API key (stored locally)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cheapest)</option>
            <option value="gpt-4">GPT-4 (More Accurate)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose based on accuracy vs. cost</p>
        </div>
        <div className="flex items-end">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !hasSelectedConversations || !apiKey.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate AI Responses'}
          </button>
        </div>
      </div>

      {/* Survey Template Display */}
      {currentTemplate && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Survey Question Template</h3>
          <div className="space-y-3">
            {currentTemplate.questions.map((question, index) => (
              <div key={question.id} className="p-3 bg-white border border-gray-200 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}: {question.text}
                    </h4>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Scale:</span> 1-{question.scale}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Labels:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(question.labels).map(([rating, label]) => (
                          <span key={rating} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {rating}: {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfigurationPanel;
