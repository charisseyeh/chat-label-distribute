export type QuestionScale = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type QuestionLabel = string;

export interface QuestionValidation {
  isValid: boolean;
  errors: string[];
}

export interface QuestionDisplayOptions {
  showLabels: boolean;
  showNumbers: boolean;
  compactMode: boolean;
  horizontalLayout: boolean;
}

export interface QuestionTemplate {
  id: string;
  name: string;
  defaultScale: QuestionScale;
  defaultLabels: Record<number, string>;
  isSystem: boolean; // System questions cannot be deleted
  order: number;
}
