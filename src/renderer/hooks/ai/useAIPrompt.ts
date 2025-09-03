import { useCallback, useMemo } from 'react';
import { useAssessmentQuestionStore } from '../../stores/assessmentQuestionStore';
import { AIPromptService } from '../../services/assessment/aiPromptService';
import { AIPromptConfig, AssessmentTemplate } from '../../types/assessment';

export const useAIPrompt = () => {
  const { currentTemplate } = useAssessmentQuestionStore();

  // Generate prompt configuration for a specific position
  const generatePromptConfig = useCallback((
    conversationContext: string,
    position: 'beginning' | 'turn6' | 'end'
  ): AIPromptConfig | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for AI prompt generation');
      return null;
    }

    try {
      return AIPromptService.generatePromptConfig(
        currentTemplate,
        conversationContext,
        position
      );
    } catch (error) {
      console.error('Failed to generate prompt config:', error);
      return null;
    }
  }, [currentTemplate]);

  // Generate OpenAI API prompt
  const generateOpenAIPrompt = useCallback((
    conversationContext: string,
    position: 'beginning' | 'turn6' | 'end'
  ): string | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for AI prompt generation');
      return null;
    }

    try {
      return AIPromptService.generateOpenAIPrompt(
        currentTemplate,
        conversationContext,
        position
      );
    } catch (error) {
      console.error('Failed to generate OpenAI prompt:', error);
      return null;
    }
  }, [currentTemplate]);

  // Generate system prompt only (for editing)
  const generateSystemPromptOnly = useCallback((): string | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for system prompt generation');
      return null;
    }

    try {
      return AIPromptService.generateSystemPromptOnly(currentTemplate);
    } catch (error) {
      console.error('Failed to generate system prompt:', error);
      return null;
    }
  }, [currentTemplate]);

  // Generate OpenAI API prompt with custom system prompt
  const generateOpenAIPromptWithCustomSystem = useCallback((
    customSystemPrompt: string,
    conversationContext: string,
    position: 'beginning' | 'turn6' | 'end'
  ): string | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for AI prompt generation');
      return null;
    }

    try {
      return AIPromptService.generateOpenAIPromptWithCustomSystem(
        customSystemPrompt,
        currentTemplate,
        conversationContext,
        position
      );
    } catch (error) {
      console.error('Failed to generate OpenAI prompt with custom system:', error);
      return null;
    }
  }, [currentTemplate]);

  // Generate conversation context for AI
  const generateConversationContext = useCallback((
    messages: any[],
    position: 'beginning' | 'turn6' | 'end'
  ): string => {
    return AIPromptService.generateConversationContext(messages, position);
  }, []);

  // Parse AI response to extract ratings
  const parseAIResponse = useCallback(async (
    response: string
  ): Promise<Record<string, number> | null> => {
    if (!currentTemplate) {
      console.warn('No assessment template available for AI response parsing');
      return null;
    }

    try {
      return await AIPromptService.parseAIResponse(response, currentTemplate);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  }, [currentTemplate]);

  // Validate AI response ratings
  const validateAIRatings = useCallback((
    ratings: Record<string, number>
  ): { isValid: boolean; errors: string[] } | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for AI rating validation');
      return null;
    }

    try {
      return AIPromptService.validateAIRatings(ratings, currentTemplate);
    } catch (error) {
      console.error('Failed to validate AI ratings:', error);
      return null;
    }
  }, [currentTemplate]);

  // Get rating instructions for a position
  const getRatingInstructions = useCallback((
    position: 'beginning' | 'turn6' | 'end'
  ): string | null => {
    if (!currentTemplate) {
      console.warn('No assessment template available for rating instructions');
      return null;
    }

    try {
      return AIPromptService.generateRatingInstructions(currentTemplate, position);
    } catch (error) {
      console.error('Failed to generate rating instructions:', error);
      return null;
    }
  }, [currentTemplate]);

  // Check if AI prompt generation is available
  const isAIPromptAvailable = useMemo(() => {
    return currentTemplate !== null && currentTemplate.questions.length > 0;
  }, [currentTemplate]);

  // Get available positions for AI analysis
  const getAvailablePositions = useMemo(() => {
    if (!currentTemplate) return [];
    
    return ['beginning', 'turn6', 'end'] as const;
  }, [currentTemplate]);

  // Generate complete AI analysis prompt
  const generateCompleteAnalysisPrompt = useCallback((
    messages: any[],
    position: 'beginning' | 'turn6' | 'end'
  ): string | null => {
    if (!currentTemplate) {
      return null;
    }

    try {
      const conversationContext = generateConversationContext(messages, position);
      return generateOpenAIPrompt(conversationContext, position);
    } catch (error) {
      console.error('Failed to generate complete analysis prompt:', error);
      return null;
    }
  }, [currentTemplate, generateConversationContext, generateOpenAIPrompt]);

  // Get question summary for AI
  const getQuestionSummary = useCallback((): string | null => {
    if (!currentTemplate) {
      return null;
    }

    try {
      let summary = `Survey Questions (${currentTemplate.questions.length} total):\n\n`;
      
      currentTemplate.questions.forEach((question, index) => {
        summary += `${index + 1}. ${question.text}\n`;
        summary += `   Scale: 1-${question.scale}\n`;
        summary += `   Labels: ${Object.entries(question.labels)
          .map(([rating, label]) => `${rating}=${label}`)
          .join(', ')}\n\n`;
      });
      
      return summary;
    } catch (error) {
      console.error('Failed to generate question summary:', error);
      return null;
    }
  }, [currentTemplate]);

  // Validate template for AI usage
  const validateTemplateForAI = useCallback((): { isValid: boolean; errors: string[] } => {
    if (!currentTemplate) {
      return { isValid: false, errors: ['No assessment template available'] };
    }

    const errors: string[] = [];

    if (currentTemplate.questions.length === 0) {
      errors.push('Template has no questions');
    }

    if (currentTemplate.questions.length > 10) {
      errors.push('Template has too many questions (max 10)');
    }

    // Validate each question
    currentTemplate.questions.forEach((question, index) => {
      if (!question.text || question.text.trim().length === 0) {
        errors.push(`Question ${index + 1}: Missing text`);
      }

      if (!question.scale || question.scale < 2 || question.scale > 10) {
        errors.push(`Question ${index + 1}: Invalid scale (must be 2-10)`);
      }

      if (!question.labels || Object.keys(question.labels).length !== question.scale) {
        errors.push(`Question ${index + 1}: Label count doesn't match scale`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [currentTemplate]);

  return {
    // Core functionality
    generatePromptConfig,
    generateOpenAIPrompt,
    generateSystemPromptOnly,
    generateOpenAIPromptWithCustomSystem,
    generateConversationContext,
    parseAIResponse,
    validateAIRatings,
    
    // Utility functions
    getRatingInstructions,
    generateCompleteAnalysisPrompt,
    getQuestionSummary,
    validateTemplateForAI,
    
    // State
    isAIPromptAvailable,
    getAvailablePositions,
    currentTemplate
  };
};
