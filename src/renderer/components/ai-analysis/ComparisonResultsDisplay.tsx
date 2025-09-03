import React from 'react';
import { AssessmentTemplate } from '../../types/assessment';

// Types based on your JSON structure
interface ComparisonData {
  conversationId: string;
  conversationTitle: string;
  humanResponses: Record<string, number>;
  aiResponses: Record<string, number>;
  agreement: number;
  differences: any[];
}

interface ComparisonResults {
  timestamp: string;
  template: AssessmentTemplate;
  comparisons: ComparisonData[];
  trials: any[];
  accuracy: number;
}



interface ComparisonResultsDisplayProps {
  comparisonData?: ComparisonData[];
  trialComparisons?: any[];
  currentTemplate?: AssessmentTemplate | null;
  model?: string;
}

export const ComparisonResultsDisplay: React.FC<ComparisonResultsDisplayProps> = ({
  comparisonData,
  trialComparisons,
  currentTemplate,
  model
}) => {
  // Use actual props data
  const comparisons = comparisonData || [];
  const template = currentTemplate;

  if (!comparisons || comparisons.length === 0 || !template) {
    return (
      <div className="m-4 p-6 text-left">
        <h2 className="text-h2 mb-2">No Comparison Results Yet</h2>
        <p className="text-body-secondary">
          Select conversations from the sidebar and run AI comparison to see results here.
        </p>
      </div>
    );
  }

  // Helper function to get rating for a specific question and time point
  const getRating = (responses: Record<string, number>, questionId: string, timePoint: string) => {
    const key = `${timePoint}_${questionId}`;
    return responses[key] || 0;
  };

  // Helper function to get label for a rating
  const getLabel = (questionId: string, rating: number) => {
    const question = template.questions.find(q => q.id === questionId);
    return question?.labels?.[rating] || rating.toString();
  };

  return (
    <div className="p-6 space-y-6">
      {comparisons.map((comparison, index) => (
        <div key={comparison.conversationId} className="container-lg">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-h3 text-gray-900 mb-2">{comparison.conversationTitle}</h1>
              <div className="space-y-0">
                <p className="text-small">Model for AI labeling: {model || 'Not specified'}</p>
                <p className="text-small">Assessment template: {template.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-normal">
                {Math.round(comparison.agreement)}% agreement
              </div>
            </div>
          </div>
            
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse [&_th]:py-1 [&_th]:px-0 [&_td]:py-0 [&_td]:px-0">
              <thead>
                <tr>
                  <th className="text-left text-small"></th>
                  <th className="text-center text-small">Beginning of Conversation</th>
                  <th className="text-center text-small">Middle of Conversation</th>
                  <th className="text-center text-small">End of Conversation</th>
                </tr>
                <tr>
                  <th></th>
                  <th className="text-center">
                    <div className="flex justify-center space-x-6">
                      <span className="text-small text-gray-600 w-6 text-center">You</span>
                      <span className="text-small text-purple-600 w-6 text-center">AI</span>
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="flex justify-center space-x-6">
                      <span className="text-small text-gray-600 w-6 text-center">You</span>
                      <span className="text-small text-purple-600 w-6 text-center">AI</span>
                    </div>
                  </th>
                  <th className="text-center">
                    <div className="flex justify-center space-x-6">
                      <span className="text-small text-gray-600 w-6 text-center">You</span>
                      <span className="text-small text-purple-600 w-6 text-center">AI</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {template.questions.map((question) => (
                  <tr key={question.id} className="h-16">
                    <td className="font-medium text-gray-900 align-middle">
                      {question.text}
                    </td>
                    {/* Beginning */}
                    <td className="text-center align-middle">
                      <div className="flex justify-center space-x-6">
                        <span className="text-gray-900 w-6 text-center">
                          {getRating(comparison.humanResponses, question.id, 'beginning')}
                        </span>
                        <span className="text-purple-600 w-6 text-center">
                          {getRating(comparison.aiResponses, question.id, 'beginning')}
                        </span>
                      </div>
                    </td>
                    {/* Middle */}
                    <td className="text-center align-middle">
                      <div className="flex justify-center space-x-6">
                        <span className="text-gray-900 w-6 text-center">
                          {getRating(comparison.humanResponses, question.id, 'turn6')}
                        </span>
                        <span className="text-purple-600 w-6 text-center">
                          {getRating(comparison.aiResponses, question.id, 'turn6')}
                        </span>
                      </div>
                    </td>
                    {/* End */}
                    <td className="text-center align-middle">
                      <div className="flex justify-center space-x-6">
                        <span className="text-gray-900 w-6 text-center">
                          {getRating(comparison.humanResponses, question.id, 'end')}
                        </span>
                        <span className="text-purple-600 w-6 text-center">
                          {getRating(comparison.aiResponses, question.id, 'end')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparisonResultsDisplay;
