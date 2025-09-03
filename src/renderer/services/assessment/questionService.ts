import { AssessmentQuestion, AssessmentTemplate } from '../../types/assessment';
import { QuestionValidation } from '../../types/question';

export class QuestionService {
  /**
   * Validates a assessment question
   */
  static validateQuestion(question: Partial<AssessmentQuestion>): QuestionValidation {
    const errors: string[] = [];

    if (!question.text || question.text.trim().length === 0) {
      errors.push('Question text is required');
    }

    if (!question.scale || question.scale < 2 || question.scale > 10) {
      errors.push('Scale must be between 2 and 10');
    }

    if (question.labels && Object.keys(question.labels).length !== question.scale) {
      errors.push(`Number of labels must match scale (${question.scale})`);
    }

    if (question.labels) {
      // Check if all scale values have labels
      for (let i = 1; i <= (question.scale || 5); i++) {
        if (!question.labels[i]) {
          errors.push(`Missing label for rating ${i}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a complete assessment template
   */
  static validateTemplate(template: AssessmentTemplate): QuestionValidation {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.questions || template.questions.length === 0) {
      errors.push('Template must have at least one question');
    }

    if (template.questions && template.questions.length > 10) {
      errors.push('Template cannot have more than 10 questions');
    }

    // Validate each question
    template.questions.forEach((question, index) => {
      const questionValidation = this.validateQuestion(question);
      if (!questionValidation.isValid) {
        questionValidation.errors.forEach(error => {
          errors.push(`Question ${index + 1}: ${error}`);
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Creates a new question with default values
   */
  static createDefaultQuestion(): Omit<AssessmentQuestion, 'id' | 'order'> {
    return {
      text: '',
      scale: 5,
      labels: {
        1: 'Very Poor',
        2: 'Poor',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
      },
      // category: 'custom' // Not part of AssessmentQuestion interface
    };
  }

  /**
   * Generates labels for a given scale
   */
  static generateDefaultLabels(scale: number): Record<number, string> {
    const labels: Record<number, string> = {};
    
    if (scale === 2) {
      labels[1] = 'No';
      labels[2] = 'Yes';
    } else if (scale === 3) {
      labels[1] = 'Low';
      labels[2] = 'Medium';
      labels[3] = 'High';
    } else if (scale === 5) {
      labels[1] = 'Very Poor';
      labels[2] = 'Poor';
      labels[3] = 'Average';
      labels[4] = 'Good';
      labels[5] = 'Excellent';
    } else if (scale === 7) {
      labels[1] = 'Very Low';
      labels[2] = 'Low';
      labels[3] = 'Somewhat Low';
      labels[4] = 'Neutral';
      labels[5] = 'Somewhat High';
      labels[6] = 'High';
      labels[7] = 'Very High';
    } else if (scale === 10) {
      labels[1] = '1';
      labels[2] = '2';
      labels[3] = '3';
      labels[4] = '4';
      labels[5] = '5';
      labels[6] = '6';
      labels[7] = '7';
      labels[8] = '8';
      labels[9] = '9';
      labels[10] = '10';
    }

    return labels;
  }

  /**
   * Reorders questions in a template
   */
  static reorderQuestions(template: AssessmentTemplate, newOrder: string[]): AssessmentTemplate {
    const reorderedQuestions = newOrder.map((id, index) => {
      const question = template.questions.find(q => q.id === id);
      return question ? { ...question, order: index + 1 } : null;
    }).filter(Boolean) as AssessmentQuestion[];

    return {
      ...template,
      questions: reorderedQuestions,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Gets questions for a specific assessment position
   */
  static getQuestionsForPosition(template: AssessmentTemplate, position: 'beginning' | 'turn6' | 'end'): AssessmentQuestion[] {
    // For now, all questions apply to all positions
    // This could be extended to have position-specific questions
    return template.questions.sort((a, b) => a.order - b.order);
  }

  /**
   * Checks if a question is answered
   */
  static isQuestionAnswered(questionId: string, responses: any[]): boolean {
    return responses.some(response => 
      response.questionId === questionId && response.rating > 0
    );
  }

  /**
   * Gets the rating for a specific question
   */
  static getQuestionRating(questionId: string, responses: any[]): number {
    const response = responses.find(r => r.questionId === questionId);
    return response ? response.rating : 0;
  }
}
