import { useState, useCallback } from 'react';
import { AIService } from '../../services/ai/ai-service';
import { useAIPrompt } from './useAIPrompt';
import { useAssessmentQuestionStore } from '../../stores/assessmentQuestionStore';
import { useConversationStore } from '../../stores/conversationStore';
import {
  ComparisonData,
  TrialComparison,
  GenerationProgress,
  calculateAgreement,
  calculateDifferences
} from '../../services/ai/aiComparisonService';

export const useAIGeneration = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [trialComparisons, setTrialComparisons] = useState<TrialComparison[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    currentTrial: 0,
    totalTrials: 3,
    currentConversation: 0,
    totalConversations: 0,
    currentPosition: 0,
    totalPositions: 3,
    status: 'connecting',
    currentOperation: '',
    currentPrompt: ''
  });

  const { currentTemplate } = useAssessmentQuestionStore();
  const { selectedConversations: storeConversations } = useConversationStore();
  const { generateOpenAIPrompt, generateOpenAIPromptWithCustomSystem, parseAIResponse } = useAIPrompt();

  const initializeAIService = useCallback((apiKey: string, model: string) => {
    if (!apiKey.trim()) {
      throw new Error('Please enter an OpenAI API key');
    }
    
    const cleanApiKey = apiKey.trim();
    
    if (!cleanApiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. API key should start with "sk-"');
    }
    
    const service = new AIService(cleanApiKey, model || 'gpt-4o');
    setAIService(service);
    return service;
  }, []);

  const generateAIResponses = useCallback(async (
    selectedConversationIds: string[],
    apiKey: string,
    model: string,
    getConversationData: (id: string) => any,
    customSystemPrompt?: string
  ) => {
    let service = aiService;
    
    if (!service) {
      service = initializeAIService(apiKey, model);
    }

    if (!service.isConfigured()) {
      throw new Error('AI service not properly configured');
    }

    if (!currentTemplate) {
      throw new Error('No assessment template available. Please create assessment questions first.');
    }

    if (selectedConversationIds.length === 0) {
      throw new Error('Please select at least one conversation to analyze.');
    }

    setIsGenerating(true);
    
    setGenerationProgress({
      currentTrial: 0,
      totalTrials: 1,
      currentConversation: 0,
      totalConversations: selectedConversationIds.length,
      currentPosition: 0,
      totalPositions: 3,
      status: 'connecting',
      currentOperation: '',
      currentPrompt: ''
    });

    const results: ComparisonData[] = [];
    const trials: TrialComparison[] = [];

    try {
      setGenerationProgress(prev => ({ ...prev, status: 'generating' }));

      for (let convIndex = 0; convIndex < selectedConversationIds.length; convIndex++) {
        const conversationId = selectedConversationIds[convIndex];
        const conversation = storeConversations.find(c => c.id === conversationId);
        if (!conversation) continue;

        setGenerationProgress((prev: GenerationProgress) => ({ 
          ...prev, 
          currentConversation: convIndex + 1,
          currentOperation: `Processing conversation: ${conversation.title}`
        }));

        const data = getConversationData(conversationId);
        const humanResponses: Record<string, number> = {};
        
        data.responses.forEach((response: { position: string; questionId: string; rating: number }) => {
          const positionKey = `${response.position}_${response.questionId}`;
          humanResponses[positionKey] = response.rating;
        });

        const aiResponses: Record<string, number> = {};
        
        // Process all three positions: beginning, turn6, end
        const positions: Array<'beginning' | 'turn6' | 'end'> = ['beginning', 'turn6', 'end'];
        
        for (let posIndex = 0; posIndex < positions.length; posIndex++) {
          const position = positions[posIndex];
          
          try {
            const conversationContext = `Conversation: ${conversation.title}`;
            let prompt: string | null;
            
            if (customSystemPrompt) {
              prompt = generateOpenAIPromptWithCustomSystem(customSystemPrompt, conversationContext, position);
            } else {
              prompt = generateOpenAIPrompt(conversationContext, position);
            }
            
            if (!prompt) continue;

            setGenerationProgress((prev: GenerationProgress) => ({ 
              ...prev, 
              currentPosition: posIndex + 1,
              currentOperation: `Generating AI response for: ${conversation.title} (${position})`,
              currentPrompt: prompt
            }));

            const aiResponse = await service.generateSurveyResponses(prompt);
            console.log(`🤖 AI Response received for ${position}:`, aiResponse);
            
            const parsedRatings = await parseAIResponse(aiResponse);
            console.log(`📊 Parsed ratings for ${position}:`, parsedRatings);
            
            if (parsedRatings) {
              Object.entries(parsedRatings).forEach(([questionId, rating]) => {
                const positionKey = `${position}_${questionId}`;
                aiResponses[positionKey] = rating;
              });
            }
          } catch (error) {
            console.error(`Error generating AI response for: ${conversation.title} at ${position}`, error);
          }
        }

        const agreement = calculateAgreement(humanResponses, aiResponses);
        const differences = calculateDifferences(humanResponses, aiResponses, currentTemplate);

        results.push({
          conversationId,
          conversationTitle: conversation.title || 'Unknown',
          humanResponses,
          aiResponses,
          agreement,
          differences
        });
      }

      setGenerationProgress((prev: GenerationProgress) => ({ 
        ...prev, 
        status: 'processing',
        currentOperation: 'Processing results and calculating accuracy...'
      }));

      setComparisonData(results);
      setTrialComparisons(trials);
      
      const overallAccuracy = 0; // Placeholder, actual calculation needs to be implemented
      setAccuracy(overallAccuracy);

      setGenerationProgress((prev: GenerationProgress) => ({ 
        ...prev, 
        status: 'complete',
        currentOperation: 'AI generation completed successfully!'
      }));

    } catch (error) {
      console.error('Error generating AI responses:', error);
      setGenerationProgress((prev: GenerationProgress) => ({ 
        ...prev, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      throw error;
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setGenerationProgress({
          currentTrial: 0,
          totalTrials: 1,
          currentConversation: 0,
          totalConversations: 0,
          currentPosition: 0,
          totalPositions: 3,
          status: 'connecting',
          currentOperation: '',
          currentPrompt: ''
        });
      }, 3000);
    }
  }, [aiService, currentTemplate, storeConversations, generateOpenAIPrompt, generateOpenAIPromptWithCustomSystem, parseAIResponse, initializeAIService]);

  return {
    comparisonData,
    trialComparisons,
    isGenerating,
    accuracy,
    generationProgress,
    generateAIResponses
  };
};
