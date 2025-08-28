import React from 'react';

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

interface IndividualResultsProps {
  comparisonData: ComparisonData[];
}

const IndividualResults: React.FC<IndividualResultsProps> = ({ comparisonData }) => {
  return (
    <div className="mt-8">
      <h4 className="text-h3 text-gray-900 mb-4">Individual Conversation Results</h4>
      <div className="space-y-4">
        {comparisonData.map((comparison, index) => (
          <div key={comparison.conversationId} className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-large-medium text-gray-900 mb-3">
              {comparison.conversationTitle}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agreement Score */}
              <div className="text-center">
                <div className="text-large-semibold text-blue-600">
                  {comparison.agreement.toFixed(1)}%
                </div>
                <div className="text-small text-gray-500">Agreement Score</div>
              </div>

              {/* Differences */}
              <div>
                <h6 className="text-small-medium text-gray-900 mb-2">Rating Differences</h6>
                <div className="space-y-2">
                  {comparison.differences.slice(0, 6).map((diff, diffIndex) => (
                    <div key={diffIndex} className="flex justify-between text-small">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {diff.questionText}
                      </span>
                      <span className={`font-medium ${
                        diff.difference === 0 ? 'text-green-600' : 
                        diff.difference === 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {diff.humanRating} → {diff.aiRating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Position-based Results */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h6 className="text-small-medium text-gray-900 mb-3">Results by Position</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['beginning', 'turn6', 'end'].map((position) => {
                  const positionHumanResponses = Object.entries(comparison.humanResponses)
                    .filter(([key]) => key.startsWith(`${position}_`))
                    .reduce((acc, [key, value]) => {
                      const questionId = key.replace(`${position}_`, '');
                      acc[questionId] = value;
                      return acc;
                    }, {} as Record<string, number>);
                  
                  const positionAIResponses = Object.entries(comparison.aiResponses)
                    .filter(([key]) => key.startsWith(`${position}_`))
                    .reduce((acc, [key, value]) => {
                      const questionId = key.replace(`${position}_`, '');
                      acc[questionId] = value;
                      return acc;
                    }, {} as Record<string, number>);
                  
                  const positionAgreement = Object.keys(positionHumanResponses).length > 0 ? 
                    (Object.keys(positionHumanResponses).filter(qId => 
                      positionHumanResponses[qId] === positionAIResponses[qId]
                    ).length / Object.keys(positionHumanResponses).length) * 100 : 0;
                  
                  return (
                    <div key={position} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-small-medium text-gray-700 capitalize mb-2">
                        {position === 'turn6' ? 'Mid-Conversation' : position === 'beginning' ? 'Beginning' : 'End'}
                      </div>
                      <div className="text-large-semibold text-blue-600">
                        {positionAgreement.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {Object.keys(positionHumanResponses).length} questions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndividualResults;
