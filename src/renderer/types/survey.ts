export interface SurveyQuestion {
  id: string;
  text: string;
  scale: number; // 5, 7, 10, etc.
  labels: Record<number, string>; // {1: "Very Poor", 2: "Poor", ...}
  order: number; // Display order within survey section
}

export interface SurveyTemplate {
  id: string;
  name: string;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  conversationId: string;
  position: 'beginning' | 'turn6' | 'end';
  questionId: string;
  rating: number;
  timestamp: string;
}

export interface ConversationSurveyData {
  conversationId: string;
  responses: SurveyResponse[];
  completedSections: string[];
  lastUpdated: string;
}

export interface AIPromptConfig {
  templateId: string;
  questions: Array<{
    id: string;
    text: string;
    scale: number;
    labels: Record<number, string>;
    position: 'beginning' | 'turn6' | 'end';
  }>;
  conversationContext: string;
  ratingInstructions: string;
}

export interface SurveySection {
  position: 'beginning' | 'turn6' | 'end';
  title: string;
  description: string;
  isVisible: boolean;
  isCompleted: boolean;
  questions: SurveyQuestion[];
}

export interface SurveyProgress {
  totalQuestions: number;
  answeredQuestions: number;
  completedSections: string[];
  overallProgress: number;
}
