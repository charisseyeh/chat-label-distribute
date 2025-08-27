import React, { useState, useMemo } from 'react';
import { useSurveyResponseStore } from '../stores/surveyResponseStore';
import { useSurveyQuestionStore } from '../stores/surveyQuestionStore';
import { useConversationStore } from '../stores/conversationStore';
import { useAIPrompt } from '../hooks/useAIPrompt';
import { AIService } from '../services/ai-service';
import { TwoPanelLayout } from '../components/common';
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
    if (!apiKey.trim()) {
      alert('Please enter an OpenAI API key');
      return;
    }
    
    const cleanApiKey = apiKey.trim();
    
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
    let service = aiService;
    
    if (!service) {
      const newService = initializeAIService();
      if (!newService) {
        console.error('❌ Failed to initialize AI service');
        return;
      }
      service = newService;
      setAIService(newService);
    }

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

    // Debug: Log the current template
    console.log('🔍 Current template for AI generation:', currentTemplate);
    console.log('🔍 Template questions:', currentTemplate.questions);

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

      // Generate AI responses for each conversation (only once per conversation)
      for (let convIndex = 0; convIndex < selectedConversations.length; convIndex++) {
        const conversationId = selectedConversations[convIndex];
        const conversation = storeConversations.find(c => c.id === conversationId);
        if (!conversation) continue;

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
    <TwoPanelLayout
      sidebarContent={
        <div className="p-6 space-y-6">
          {/* Chat Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Conversations</h3>
            <ConversationSelector
              conversations={conversationsWithData}
              selectedConversations={selectedConversations}
              onConversationToggle={handleConversationToggle}
            />
          </div>

          {/* AI Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Comparison</h3>
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
          </div>

          {/* Prompt Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Configuration</h3>
            <PromptPreview
              currentTemplate={currentTemplate}
              selectedConversations={selectedConversations}
              storeConversations={storeConversations}
              generateOpenAIPrompt={generateOpenAIPrompt}
            />
          </div>

          {/* Global Actions */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 px-4 rounded-md transition-colors">
              Share Results
            </button>
          </div>
        </div>
      }
    >
      {/* Main Content Area - AI Comparison Results */}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Comparison</h1>
          <p className="text-lg text-gray-600">
            Select reflective or therapy-like chats that you had with ChatGPT below to label it
          </p>
        </div>

        {/* Progress and Status Display */}
        {isGeneratingAI && (
          <ProgressTracker
            progress={generationProgress}
            storeConversations={storeConversations}
            selectedConversations={selectedConversations}
          />
        )}

        {/* AI Comparison Results Tables */}
        {comparisonData.length > 0 && (
          <div className="space-y-6">
            {comparisonData.map((comparison, index) => (
              <div key={comparison.conversationId} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{comparison.conversationTitle}</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">AI model {model}</div>
                    <div className="text-lg font-bold text-blue-600">
                      Accuracy {Math.round(comparison.agreement * 100)}%
                    </div>
                  </div>
                </div>
                
                {/* Comparison Table */}
                <ComparisonResults
                  comparisonData={[comparison]}
                  trialComparisons={trialComparisons}
                  currentTemplate={currentTemplate}
                  model={model}
                  accuracy={comparison.agreement * 100}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {comparisonData.length === 0 && !isGeneratingAI && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Comparison Results Yet</h3>
            <p className="text-gray-600 mb-4">
              Select conversations from the sidebar and run AI comparison to see results here.
            </p>
            <div className="text-sm text-gray-500">
              The comparison will show your ratings vs. AI ratings across different psychological dimensions.
            </div>
          </div>
        )}
      </div>
    </TwoPanelLayout>
  );
};

export default AIComparisonsPage;
