import React from 'react';
import { SurveyTemplate } from '../../types/survey';

interface ComparisonData {
  conversationId: string;
  conversationTitle: string;
  humanResponses: Record<string, number>;
  aiResponses: Record<string, number>;
  agreement: number;
  differences: Array<{
    questionId: string;
    questionText: string;
    humanRating: number;
    aiRating: number;
    difference: number;
  }>;
}

interface TrialComparison {
  trialNumber: number;
  humanRatings: Record<string, number>;
  aiRatings: Record<string, number>;
}

interface AIComparisonExportProps {
  comparisonData: ComparisonData[];
  trialComparisons: TrialComparison[];
  accuracy: number;
  currentTemplate: SurveyTemplate | null;
}

const AIComparisonExport: React.FC<AIComparisonExportProps> = ({
  comparisonData,
  trialComparisons,
  accuracy,
  currentTemplate
}) => {
  const exportComparisonData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      template: currentTemplate,
      comparisons: comparisonData,
      trials: trialComparisons,
      accuracy: accuracy
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
        <p className="text-sm text-gray-600 mb-4">
          Download the comparison data for further analysis in external tools.
        </p>
        <button
          onClick={exportComparisonData}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Export JSON Data
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• {comparisonData.length} conversations analyzed</div>
          <div>• {currentTemplate?.questions.length || 0} questions per conversation</div>
          <div>• {comparisonData.length * 3} survey positions analyzed</div>
          <div>• {trialComparisons.length} trials generated</div>
          <div>• Overall accuracy: {accuracy.toFixed(1)}%</div>
          <div>• Timestamp: {new Date().toISOString()}</div>
        </div>
      </div>
    </div>
  );
};

export default AIComparisonExport;
