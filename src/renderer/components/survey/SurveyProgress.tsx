import React from 'react';

interface SurveyProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
  completedSections: string[];
}

const SurveyProgress: React.FC<SurveyProgressProps> = ({
  totalQuestions,
  answeredQuestions,
  completedSections
}) => {
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const totalSections = 3; // beginning, turn6, end
  const completedSectionsCount = completedSections.length;

  const getSectionStatus = (section: string) => {
    return completedSections.includes(section);
  };

  const getSectionIcon = (section: string, isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    switch (section) {
      case 'beginning':
        return <span className="text-blue-500">🚀</span>;
      case 'turn6':
        return <span className="text-yellow-500">🔄</span>;
      case 'end':
        return <span className="text-green-500">🏁</span>;
      default:
        return <span className="text-gray-500">📝</span>;
    }
  };

  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'beginning':
        return 'Beginning';
      case 'turn6':
        return 'Turn 6';
      case 'end':
        return 'End';
      default:
        return section;
    }
  };

  return (
    <div className="space-y-3">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Progress Text */}
        <div className="text-center text-xs text-gray-600">
          <span className="font-medium">{answeredQuestions}</span> of <span className="font-medium">{totalQuestions}</span> questions answered
        </div>
      </div>

      {/* Section Status */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Section Status</div>
        <div className="grid grid-cols-3 gap-2">
          {['beginning', 'turn6', 'end'].map((section) => {
            const isCompleted = getSectionStatus(section);
            
            return (
              <div
                key={section}
                className={`
                  flex flex-col items-center p-2 rounded-lg text-xs transition-colors
                  ${isCompleted 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }
                `}
              >
                <div className="mb-1">
                  {getSectionIcon(section, isCompleted)}
                </div>
                <div className="text-center">
                  <div className="font-medium">{getSectionLabel(section)}</div>
                  <div className={isCompleted ? 'text-green-600' : 'text-gray-500'}>
                    {isCompleted ? 'Complete' : 'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Summary */}
      <div className="text-center">
        <div className={`
          inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
          ${completedSectionsCount === totalSections
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
          }
        `}>
          <span>
            {completedSectionsCount === totalSections ? '🎉 All sections complete!' : '📊 Survey in progress'}
          </span>
          <span>
            {completedSectionsCount}/{totalSections} sections
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurveyProgress;
