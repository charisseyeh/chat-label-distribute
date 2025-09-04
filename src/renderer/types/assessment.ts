export interface AssessmentQuestion {
  id: string;
  text: string;
  scale: number; // 5, 7, 10, etc.
  labels: Record<number, string>; // {1: "Very Poor", 2: "Poor", ...}
  order: number; // Display order within Assessment section
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  questions: AssessmentQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResponse {
  id: string;
  conversationId: string;
  position: 'beginning' | 'turn6' | 'end';
  questionId: string;
  rating: number;
  timestamp: string;
}

export interface ConversationAssessmentData {
  conversationId: string;
  responses: AssessmentResponse[];
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

export interface AssessmentSection {
  position: 'beginning' | 'turn6' | 'end';
  title: string;
  description: string;
  isVisible: boolean;
  isCompleted: boolean;
  questions: AssessmentQuestion[];
}

export interface AssessmentProgress {
  totalQuestions: number;
  answeredQuestions: number;
  completedSections: string[];
  overallProgress: number;
}
