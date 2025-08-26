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
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Conversation Results</h4>
      <div className="space-y-4">
        {comparisonData.map((comparison, index) => (
          <div key={comparison.conversationId} className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-md font-semibold text-gray-900 mb-3">
              {comparison.conversationTitle}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agreement Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {comparison.agreement.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Agreement Score</div>
              </div>

              {/* Differences */}
              <div>
                <h6 className="font-medium text-gray-900 mb-2">Rating Differences</h6>
                <div className="space-y-2">
                  {comparison.differences.slice(0, 3).map((diff, diffIndex) => (
                    <div key={diffIndex} className="flex justify-between text-sm">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndividualResults;
