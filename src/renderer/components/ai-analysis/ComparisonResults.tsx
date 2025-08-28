import React, { useState } from 'react';
import { ComparisonData, TrialComparison } from '../../services/ai/aiComparisonService';
import TrialComparisonTable from './TrialComparisonTable';
import IndividualResults from './IndividualResults';
import AIAnalysisTab from './AIAnalysisTab';
import { AIComparisonExport } from '../export';
import { SurveyTemplate } from '../../types/survey';

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
              className={`btn btn-tab ${activeTab === tab.id ? 'active' : ''}`}
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
                <h3 className="text-h3 text-gray-900">
                  AI model {model}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-large-semibold text-blue-600">
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
