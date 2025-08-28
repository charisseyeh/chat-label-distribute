import React from 'react';
import { ComparisonData, TrialComparison } from '../../services/aiComparisonService';
import ComparisonResults from './ComparisonResults';
import { SurveyTemplate } from '../../types/survey';

interface ComparisonResultsDisplayProps {
  comparisonData: ComparisonData[];
  trialComparisons: TrialComparison[];
  currentTemplate: SurveyTemplate | null;
  model: string;
}

export const ComparisonResultsDisplay: React.FC<ComparisonResultsDisplayProps> = ({
  comparisonData,
  trialComparisons,
  currentTemplate,
  model
}) => {
  if (comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-left">
        <h2 className="mb-2">No Comparison Results Yet</h2>
        <p className="text-muted-foreground mb-4">
          Select conversations from the sidebar and run AI comparison to see results here.
        </p>
        <div className="text-muted-foreground">
          The comparison will show your ratings vs. AI ratings across different psychological dimensions.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comparisonData.map((comparison) => (
        <div key={comparison.conversationId} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-foreground">{comparison.conversationTitle}</h1>
            <div className="text-right">
              <p className="text-muted-foreground">AI model {model}</p>
              <div className="text-blue-600 font-weight-semibold">
                Accuracy {Math.round(comparison.agreement * 100)}%
              </div>
            </div>
          </div>
          
          <ComparisonResults
            comparisonData={[comparison]}
            trialComparisons={trialComparisons}
            currentTemplate={currentTemplate}
            model={model}
            accuracy={comparison.agreement * 100}
          />
        </div>
      ))}
    </div>
  );
};

export default ComparisonResultsDisplay;
