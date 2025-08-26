import React, { useState, useMemo } from 'react';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { useSurveyQuestionStore } from '../stores/surveyQuestionStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAIPrompt } from '../hooks/useAIPrompt';
import { AIService } from '../services/ai-service';
import {
  AIConfigurationPanel,
  ConversationSelector,
  ProgressTracker,
  PromptPreview,
  ComparisonResults
} from '../components/ai-analysis';
import {
  ComparisonData,
  TrialComparison,
  GenerationProgress,
  calculateAgreement,
  calculateDifferences,
  calculateOverallAccuracy,
  initializeGenerationProgress
} from '../services/aiComparisonService';

const AIComparisonsPage: React.FC = () => {
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [trialComparisons, setTrialComparisons] = useState<TrialComparison[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
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

  const { conversationData, getConversationData } = useSurveyResponseStore();
  const { currentTemplate } = useSurveyQuestionStore();
  const { selectedConversations: storeConversations } = useConversationStore();
  const { generateCompleteAnalysisPrompt, generateOpenAIPrompt, parseAIResponse, validateAIRatings } = useAIPrompt();

  // Get conversations with survey data
  const conversationsWithData = useMemo(() => {
    return Object.keys(conversationData).map(conversationId => {
      const data = conversationData[conversationId];
      const conversation = storeConversations.find(c => c.id === conversationId);
      return {
        id: conversationId,
        title: conversation?.title || 'Unknown Conversation',
        data,
        hasResponses: data.responses.length > 0
      };
    }).filter(conv => conv.hasResponses);
  }, [conversationData, storeConversations]);

  // Initialize AI service
  const initializeAIService = () => {
    console.log('🔍 initializeAIService called with apiKey:', apiKey);
    console.log('🔍 apiKey length:', apiKey.length);
    console.log('🔍 apiKey trimmed:', apiKey.trim());
    
    if (!apiKey.trim()) {
      alert('Please enter an OpenAI API key');
      return;
    }
    
    const cleanApiKey = apiKey.trim();
    console.log('🔍 Clean API key being used:', cleanApiKey.substring(0, 10) + '...');
    
    // Validate the API key format
    if (!cleanApiKey.startsWith('sk-')) {
      console.error('❌ Invalid API key format:', cleanApiKey);
      alert('Invalid API key format. API key should start with "sk-"');
      return;
    }
    
    const service = new AIService(cleanApiKey, model || 'gpt-4o');
    setAIService(service);
    return service;
  };

  // Generate AI responses for selected conversations
  const generateAIResponses = async () => {
    console.log('🔍 generateAIResponses called');
    console.log('🔍 Current apiKey state:', apiKey);
    console.log('🔍 Current apiKey length:', apiKey.length);
    console.log('🔍 Current apiKey trimmed:', apiKey.trim());
    
    let service = aiService;
    
    console.log('🔍 Current aiService state:', aiService);
    
    if (!service) {
      console.log('🔄 Initializing new AI service...');
      const newService = initializeAIService();
      if (!newService) {
        console.error('❌ Failed to initialize AI service');
        return;
      }
      service = newService;
      setAIService(newService);
      console.log('✅ AI service initialized:', newService);
    }

    console.log('🤖 Using AI service:', service);
    console.log('🔑 Service config:', { apiKey: '***' + apiKey.substring(0, 10) + '***', model: model });

    // Validate service configuration
    if (!service.isConfigured()) {
      console.error('❌ AI service not properly configured');
      alert('AI service not properly configured. Please check your API key and model selection.');
      return;
    }

    if (!currentTemplate) {
      alert('No survey template available. Please create survey questions first.');
      return;
    }

    if (selectedConversations.length === 0) {
      alert('Please select at least one conversation to analyze.');
      return;
    }

    if (!apiKey.trim()) {
      alert('Please enter a valid OpenAI API key.');
      return;
    }

    setIsGeneratingAI(true);
    
    // Initialize progress tracking
    setGenerationProgress(initializeGenerationProgress(selectedConversations.length));

    const results: ComparisonData[] = [];
    const trials: TrialComparison[] = [];

    try {
      // Update status to generating
      setGenerationProgress(prev => ({ ...prev, status: 'generating' }));
      console.log('🚀 Starting AI generation process with real OpenAI API...');
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
      console.log('🤖 Using model:', model);

      // Generate AI responses for each conversation (only once per conversation)
      for (let convIndex = 0; convIndex < selectedConversations.length; convIndex++) {
        const conversationId = selectedConversations[convIndex];
        const conversation = storeConversations.find(c => c.id === conversationId);
        if (!conversation) continue;

        console.log(`💬 Processing conversation ${convIndex + 1}/${selectedConversations.length}: ${conversation.title}`);
        setGenerationProgress(prev => ({ 
          ...prev, 
          currentConversation: convIndex + 1,
          currentOperation: `Processing conversation: ${conversation.title}`
        }));

        const data = getConversationData(conversationId);
        const humanResponses: Record<string, number> = {};
        
        // Extract human responses
        data.responses.forEach(response => {
          humanResponses[response.questionId] = response.rating;
        });

        // Generate AI response for this conversation (single call)
        const aiResponses: Record<string, number> = {};
        
        try {
          console.log(`🤖 Calling OpenAI API for conversation: ${conversation.title}`);
          
          const conversationContext = `Conversation: ${conversation.title}`;
          const prompt = generateOpenAIPrompt(conversationContext, 'beginning'); // Use beginning position for single analysis
          if (!prompt) continue;

          // Update progress
          setGenerationProgress(prev => ({ 
            ...prev, 
            currentPosition: 1,
            currentOperation: `Generating AI response for conversation: ${conversation.title}`,
            currentPrompt: prompt
          }));

          // Call the real OpenAI API using the local service variable
          const aiResponse = await service.generateSurveyResponses(prompt);
          console.log(`✅ OpenAI API response received for conversation: ${conversation.title}`);
          const parsedRatings = parseAIResponse(aiResponse);
          
          if (parsedRatings) {
            // Map AI ratings to question IDs
            Object.entries(parsedRatings).forEach(([questionId, rating]) => {
              aiResponses[questionId] = rating;
            });
          }
        } catch (error) {
          console.error(`❌ Error generating AI response for conversation: ${conversation.title}`, error);
          // Set error status in progress
          setGenerationProgress(prev => ({ 
            ...prev, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          }));
          // Show user-friendly error message
          if (error instanceof Error) {
            alert(`Error generating AI response: ${error.message}`);
          }
          // Continue with other conversations
        }

        console.log(`✅ Completed conversation: ${conversation.title}`);
        // Calculate agreement and differences
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

      console.log('⚙️ Processing results and calculating accuracy...');
      // Update status to processing
      setGenerationProgress(prev => ({ 
        ...prev, 
        status: 'processing',
        currentOperation: 'Processing results and calculating accuracy...'
      }));

      setComparisonData(results);
      setTrialComparisons(trials);
      
      // Calculate overall accuracy
      const overallAccuracy = calculateOverallAccuracy(trials);
      setAccuracy(overallAccuracy);

      console.log('✅ AI generation completed successfully!');
      // Update status to complete
      setGenerationProgress(prev => ({ 
        ...prev, 
        status: 'complete',
        currentOperation: 'AI generation completed successfully!'
      }));

    } catch (error) {
      console.error('Error generating AI responses:', error);
      // Set error status in progress
      setGenerationProgress(prev => ({ 
        ...prev, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
      if (error instanceof Error) {
        alert(`Error generating AI responses: ${error.message}`);
      } else {
        alert('Error generating AI responses. Please check your API key and try again.');
      }
    } finally {
      setIsGeneratingAI(false);
      // Reset progress after a delay to show completion
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
  };

  const handleConversationToggle = (conversationId: string) => {
    if (selectedConversations.includes(conversationId)) {
      setSelectedConversations(prev => prev.filter(id => id !== conversationId));
    } else {
      setSelectedConversations(prev => [...prev, conversationId]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* OpenAI API Configuration */}
      <AIConfigurationPanel
        apiKey={apiKey}
        model={model}
        onApiKeyChange={setApiKey}
        onModelChange={setModel}
        onGenerate={generateAIResponses}
        isGenerating={isGeneratingAI}
        hasSelectedConversations={selectedConversations.length > 0}
        currentTemplate={currentTemplate}
      />

      {/* Prompt Preview */}
      <PromptPreview
        currentTemplate={currentTemplate}
        selectedConversations={selectedConversations}
        storeConversations={storeConversations}
        generateOpenAIPrompt={generateOpenAIPrompt}
      />

      {/* Progress and Status Display */}
      {isGeneratingAI && (
        <ProgressTracker
          progress={generationProgress}
          storeConversations={storeConversations}
          selectedConversations={selectedConversations}
        />
      )}

      {/* Conversation Selection */}
      <ConversationSelector
        conversations={conversationsWithData}
        selectedConversations={selectedConversations}
        onConversationToggle={handleConversationToggle}
      />

      {/* Results */}
      <ComparisonResults
        comparisonData={comparisonData}
        trialComparisons={trialComparisons}
        currentTemplate={currentTemplate}
        model={model}
        accuracy={accuracy}
      />
    </div>
  );
};

export default AIComparisonsPage;
