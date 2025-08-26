import React, { useState } from 'react';
import TrialComparisonTable from './TrialComparisonTable';
import IndividualResults from './IndividualResults';
import AIAnalysisTab from './AIAnalysisTab';
import { AIComparisonExport } from '../export';
import { SurveyTemplate } from '../../types/survey';
import { ComparisonData, TrialComparison } from '../../services/aiComparisonService';

interface ComparisonResultsProps {
  comparisonData: ComparisonData[];
  trialComparisons: TrialComparison[];
  currentTemplate: SurveyTemplate | null;
  model: string;
  accuracy: number;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  comparisonData,
  trialComparisons,
  currentTemplate,
  model,
  accuracy
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'analysis' | 'export'>('comparison');

  if (comparisonData.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'comparison', label: 'Comparison Results' },
            { id: 'analysis', label: 'Analysis' },
            { id: 'export', label: 'Export' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* AI Model Info and Accuracy */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI model {model}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  Accuracy {accuracy.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <TrialComparisonTable
              trialComparisons={trialComparisons}
              currentTemplate={currentTemplate}
              model={model}
            />

            {/* Individual Conversation Results */}
            <IndividualResults comparisonData={comparisonData} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <AIAnalysisTab
            comparisonData={comparisonData}
            currentTemplate={currentTemplate}
          />
        )}

        {activeTab === 'export' && (
          <AIComparisonExport
            comparisonData={comparisonData}
            trialComparisons={trialComparisons}
            accuracy={accuracy}
            currentTemplate={currentTemplate}
          />
        )}
      </div>
    </div>
  );
};

export default ComparisonResults;
