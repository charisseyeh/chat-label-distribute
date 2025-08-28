import { useState, useCallback } from 'react';
import { AIService } from '../../services/ai/ai-service';
import { useAIPrompt } from './useAIPrompt';
import { useSurveyQuestionStore } from '../../stores/surveyQuestionStore';
import { useConversationStore } from '../../stores/conversationStore';
import {
  ComparisonData,
  TrialComparison
} from '../../services/ai/aiComparisonService';

export const useAIGeneration = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [trialComparisons, setTrialComparisons] = useState<TrialComparison[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [generationProgress, setGenerationProgress] = useState<any>({
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

  const { currentTemplate } = useSurveyQuestionStore();
  const { selectedConversations: storeConversations } = useConversationStore();
  const { generateOpenAIPrompt, parseAIResponse } = useAIPrompt();

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
    getConversationData: (id: string) => any
  ) => {
    let service = aiService;
    
    if (!service) {
      service = initializeAIService(apiKey, model);
    }

    if (!service.isConfigured()) {
      throw new Error('AI service not properly configured');
    }

    if (!currentTemplate) {
      throw new Error('No survey template available. Please create survey questions first.');
    }

    if (selectedConversationIds.length === 0) {
      throw new Error('Please select at least one conversation to analyze.');
    }

    setIsGenerating(true);
    
    setGenerationProgress({
      ...{
        currentTrial: 0,
        totalTrials: 3,
        currentConversation: 0,
        totalConversations: 0,
        currentPosition: 0,
        totalPositions: 3,
        status: 'connecting',
        currentOperation: '',
        currentPrompt: ''
      },
      totalPositions: 3
    });

    const results: ComparisonData[] = [];
    const trials: TrialComparison[] = [];

    try {
      setGenerationProgress(prev => ({ ...prev, status: 'generating' }));

      for (let convIndex = 0; convIndex < selectedConversationIds.length; convIndex++) {
        const conversationId = selectedConversationIds[convIndex];
        const conversation = storeConversations.find(c => c.id === conversationId);
        if (!conversation) continue;

        setGenerationProgress(prev => ({ 
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
        const positions: Array<'beginning' | 'turn6' | 'end'> = ['beginning', 'turn6', 'end'];
        
        for (let posIndex = 0; posIndex < positions.length; posIndex++) {
          const position = positions[posIndex];
          
          try {
            const conversationContext = `Conversation: ${conversation.title}`;
            const prompt = generateOpenAIPrompt(conversationContext, position);
            if (!prompt) continue;

            setGenerationProgress(prev => ({ 
              ...prev, 
              currentPosition: posIndex + 1,
              currentOperation: `Generating AI response for ${position} position: ${conversation.title}`,
              currentPrompt: prompt
            }));

            const aiResponse = await service.generateSurveyResponses(prompt);
            const parsedRatings = parseAIResponse(aiResponse);
            
            if (parsedRatings) {
              Object.entries(parsedRatings).forEach(([questionId, rating]) => {
                const positionKey = `${position}_${questionId}`;
                aiResponses[positionKey] = rating;
              });
            }
          } catch (error) {
            console.error(`Error generating AI response for ${position} position: ${conversation.title}`, error);
          }
        }

        const agreement = 0; // Placeholder, actual calculation needs to be implemented
        const differences = 0; // Placeholder, actual calculation needs to be implemented

        results.push({
          conversationId,
          conversationTitle: conversation.title || 'Unknown',
          humanResponses,
          aiResponses,
          agreement,
          differences
        });
      }

      setGenerationProgress(prev => ({ 
        ...prev, 
        status: 'processing',
        currentOperation: 'Processing results and calculating accuracy...'
      }));

      setComparisonData(results);
      setTrialComparisons(trials);
      
      const overallAccuracy = 0; // Placeholder, actual calculation needs to be implemented
      setAccuracy(overallAccuracy);

      setGenerationProgress(prev => ({ 
        ...prev, 
        status: 'complete',
        currentOperation: 'AI generation completed successfully!'
      }));

    } catch (error) {
      console.error('Error generating AI responses:', error);
      setGenerationProgress(prev => ({ 
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
          totalTrials: 3,
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
  }, [aiService, currentTemplate, storeConversations, generateOpenAIPrompt, parseAIResponse, initializeAIService]);

  return {
    comparisonData,
    trialComparisons,
    isGenerating,
    accuracy,
    generationProgress,
    generateAIResponses
  };
};
