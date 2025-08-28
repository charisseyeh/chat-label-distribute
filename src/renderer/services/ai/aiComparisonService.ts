import { SurveyTemplate } from '../../types/survey';

export interface ComparisonData {
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

export interface TrialComparison {
  trialNumber: number;
  humanRatings: Record<string, number>;
  aiRatings: Record<string, number>;
}

export interface GenerationProgress {
  currentTrial: number;
  totalTrials: number;
  currentConversation: number;
  totalConversations: number;
  currentPosition: number;
  totalPositions: number;
  status: 'connecting' | 'generating' | 'processing' | 'complete' | 'error';
  currentOperation: string;
  currentPrompt: string;
  error?: string;
}

/**
 * Calculate agreement percentage between human and AI ratings
 */
export const calculateAgreement = (human: Record<string, number>, ai: Record<string, number>): number => {
  const questionIds = Object.keys(human);
  if (questionIds.length === 0) return 0;

  let exactMatches = 0;
  let closeMatches = 0;

  questionIds.forEach(questionId => {
    const humanRating = human[questionId];
    const aiRating = ai[questionId];
    
    if (humanRating === aiRating) {
      exactMatches++;
    } else if (Math.abs(humanRating - aiRating) <= 1) {
      closeMatches++;
    }
  });

  return ((exactMatches + closeMatches * 0.5) / questionIds.length) * 100;
};

/**
 * Calculate differences between human and AI ratings
 */
export const calculateDifferences = (
  human: Record<string, number>, 
  ai: Record<string, number>, 
  template: SurveyTemplate
): Array<{
  questionId: string;
  questionText: string;
  humanRating: number;
  aiRating: number;
  difference: number;
}> => {
  const differences: Array<{
    questionId: string;
    questionText: string;
    humanRating: number;
    aiRating: number;
    difference: number;
  }> = [];

  template?.questions.forEach((question) => {
    const humanRating = human[question.id];
    const aiRating = ai[question.id];
    
    if (humanRating !== undefined && aiRating !== undefined) {
      differences.push({
        questionId: question.id,
        questionText: question.text,
        humanRating,
        aiRating,
        difference: Math.abs(humanRating - aiRating)
      });
    }
  });

  return differences.sort((a, b) => b.difference - a.difference);
};

/**
 * Calculate overall accuracy across all trials
 */
export const calculateOverallAccuracy = (trials: TrialComparison[]): number => {
  if (trials.length === 0) return 0;

  let totalAgreement = 0;
  let totalComparisons = 0;

  trials.forEach(trial => {
    const questionIds = Object.keys(trial.humanRatings);
    questionIds.forEach(questionId => {
      const humanRating = trial.humanRatings[questionId];
      const aiRating = trial.aiRatings[questionId];
      
      if (humanRating === aiRating) {
        totalAgreement++;
      }
      totalComparisons++;
    });
  });

  return totalComparisons > 0 ? (totalAgreement / totalComparisons) * 100 : 0;
};

/**
 * Initialize generation progress tracking
 */
export const initializeGenerationProgress = (totalConversations: number): GenerationProgress => ({
  currentTrial: 0,
  totalTrials: 3,
  currentConversation: 0,
  totalConversations,
  currentPosition: 0,
  totalPositions: 3,
  status: 'connecting',
  currentOperation: 'Initializing AI service...',
  currentPrompt: ''
});
