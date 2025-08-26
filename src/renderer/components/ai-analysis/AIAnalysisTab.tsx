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

interface AIAnalysisTabProps {
  comparisonData: ComparisonData[];
  currentTemplate: SurveyTemplate | null;
}

const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({ comparisonData, currentTemplate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Agreement */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {(comparisonData.reduce((sum, c) => sum + c.agreement, 0) / comparisonData.length).toFixed(1)}%
          </div>
          <div className="text-sm text-blue-600">Average Agreement</div>
        </div>

        {/* Total Conversations */}
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {comparisonData.length}
          </div>
          <div className="text-sm text-green-600">Conversations Analyzed</div>
        </div>

        {/* Questions with Most Disagreement */}
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {comparisonData[0]?.differences[0]?.questionText?.substring(0, 20)}...
          </div>
          <div className="text-sm text-yellow-600">Most Disputed Question</div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Question-by-Question Analysis</h4>
        {currentTemplate?.questions.map((question, qIndex) => {
          const questionComparisons = comparisonData.map(comp => {
            const human = comp.humanResponses[question.id];
            const ai = comp.aiResponses[question.id];
            return { human, ai, difference: Math.abs(human - ai) };
          }).filter(c => c.human !== undefined && c.ai !== undefined);

          if (questionComparisons.length === 0) return null;

          const avgDifference = questionComparisons.reduce((sum, c) => sum + c.difference, 0) / questionComparisons.length;
          const agreement = questionComparisons.filter(c => c.difference <= 1).length / questionComparisons.length * 100;

          return (
            <div key={question.id} className="border-b border-gray-100 py-3 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">{question.text}</span>
                <span className={`text-sm font-medium ${
                  agreement >= 80 ? 'text-green-600' :
                  agreement >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {agreement.toFixed(1)}% agreement
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Average difference: {avgDifference.toFixed(2)} points
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAnalysisTab;
