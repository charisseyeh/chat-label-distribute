import React from 'react';
import { SurveyTemplate } from '../../types/survey';

interface TrialComparison {
  trialNumber: number;
  humanRatings: Record<string, number>;
  aiRatings: Record<string, number>;
}

interface TrialComparisonTableProps {
  trialComparisons: TrialComparison[];
  currentTemplate: SurveyTemplate | null;
  model: string;
}

const TrialComparisonTable: React.FC<TrialComparisonTableProps> = ({
  trialComparisons,
  currentTemplate,
  model
}) => {
  if (!currentTemplate) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
              Assessment Category
            </th>
            {trialComparisons.map((trial, index) => (
              <React.Fragment key={trial.trialNumber}>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900">
                  You (Trial {trial.trialNumber})
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-900 bg-purple-100">
                  {model.toUpperCase()} (Trial {trial.trialNumber})
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentTemplate.questions.map((question, qIndex) => (
            <tr key={question.id} className={qIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                {question.text}
              </td>
              {trialComparisons.map((trial) => (
                <React.Fragment key={trial.trialNumber}>
                  <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">
                    {trial.humanRatings[question.id] || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-medium text-purple-600 bg-purple-50">
                    {trial.aiRatings[question.id] || '-'}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrialComparisonTable;
