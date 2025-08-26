

export interface AIConversationSample {
  title: string;
  firstMessage: string;
  conversationPreview?: string; // Add conversation preview field
}

export interface AIRelevancyResult {
  category: 'relevant' | 'not-relevant';
  explanation: string;
  conversationId?: string;
  relevancyScore?: number;
  qualityScore?: number;
  reasoning?: string;
  timestamp?: string;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(apiKey: string, model: string) {
    this.config = { apiKey, model };
  }

  async generateSurveyResponses(prompt: string): Promise<string> {
    try {
      console.log('🤖 Calling OpenAI API via IPC...');
      
      // Use the exposed electronAPI method from preload script
      const response = await (window as any).electronAPI.callOpenAIAPI({
        apiKey: this.config.apiKey,
        model: this.config.model,
        prompt: prompt
      });

      if (response.error) {
        throw new Error(`OpenAI API error: ${response.error}`);
      }

      return response.content;
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to call OpenAI API: ${error.message}`);
      } else {
        throw new Error('Failed to call OpenAI API: Unknown error');
      }
    }
  }

  async analyzeConversationRelevancy(conversationSamples: AIConversationSample[]): Promise<AIRelevancyResult[]> {
    try {
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const results: AIRelevancyResult[] = [];
      
      for (const sample of conversationSamples) {
        try {
          const result = await this.analyzeSingleConversation(sample);
          results.push(result);
        } catch (error) {
          console.error(`Error analyzing conversation ${sample.title}:`, error);
          // Continue with other conversations
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeSingleConversation(sample: AIConversationSample): Promise<AIRelevancyResult> {
    try {
      const prompt = this.buildAnalysisPrompt(sample);
      
      // Debug logging
      console.log('🔍 AI Service Debug:');
      console.log('🔑 API Key type:', typeof this.config.apiKey);
      console.log('🔑 API Key value:', this.config.apiKey);
      console.log('🔑 API Key length:', this.config.apiKey?.length);
      console.log('🤖 Model:', this.config.model);
      console.log('📝 Prompt length:', prompt.length);
      console.log('💬 Conversation Title:', sample.title);
      console.log('💬 Conversation Preview:', sample.conversationPreview);
      console.log('💬 First Message:', sample.firstMessage);
      console.log('📋 Full Prompt:', prompt);
      
      // Extract API key - handle both string and object cases
      let apiKey: string;
      let model: string;
      
      if (typeof this.config.apiKey === 'string') {
        apiKey = this.config.apiKey;
        model = this.config.model;
      } else if (this.config.apiKey && typeof this.config.apiKey === 'object' && 'apiKey' in this.config.apiKey) {
        // Handle case where config.apiKey is an object with apiKey property
        apiKey = (this.config.apiKey as any).apiKey;
        model = (this.config.apiKey as any).model || this.config.model;
      } else {
        throw new Error(`Invalid API key configuration. Type: ${typeof this.config.apiKey}, Value: ${this.config.apiKey}`);
      }
      
      if (!apiKey || typeof apiKey !== 'string') {
        throw new Error(`Invalid API key. Type: ${typeof apiKey}, Value: ${apiKey}`);
      }
      
      console.log('🔑 Extracted API Key:', apiKey.substring(0, 20) + '...');
      console.log('🔑 Extracted Model:', model);
      
      const response = await (window as any).electronAPI.callOpenAIAPI({
        apiKey: apiKey,
        model: model,
        prompt: prompt
      });

      if (response.error) {
        throw new Error(`OpenAI API error: ${response.error}`);
      }

      const content = response.content;
      
      try {
        const results = JSON.parse(content);
        if (Array.isArray(results)) {
          return {
            category: results[0]?.category || 'not_relevant', // Use AI's category, default to not_relevant
            explanation: results[0]?.reasoning || 'No reasoning provided',
            conversationId: sample.title,
            relevancyScore: results[0]?.relevancyScore || 0,
            qualityScore: results[0]?.qualityScore || 0,
            reasoning: results[0]?.reasoning || 'No reasoning provided',
            timestamp: new Date().toISOString()
          };
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildAnalysisPrompt(sample: AIConversationSample): string {
    // Get the conversation content - prefer conversationPreview, fallback to firstMessage
    const conversationContent = sample.conversationPreview || sample.firstMessage || 'No conversation content available';
    
    return `Please analyze the following conversation excerpt and determine if it contains RELATIONAL, EMOTIONAL, or PERSONAL REFLECTION content.

CONVERSATION TITLE: ${sample.title}
CONVERSATION CONTENT: ${conversationContent}

ANALYSIS CRITERIA:
- RELEVANT: Contains discussions about feelings, emotions, personal experiences, relationships, self-reflection, psychological insights, personal challenges, life events, or meaningful human experiences that reveal emotional depth or personal growth
- NOT RELEVANT: Purely tactical, technical, factual, or surface-level exchanges without emotional depth, personal reflection, or relationship content

IMPORTANT: Look for any signs of personal experience, emotional expression, relationship dynamics, or self-reflection. Even brief mentions of personal feelings or experiences can make a conversation relevant.

Please provide a JSON response with:
1. relevancyScore (0-10): How relevant is this conversation for understanding human experiences and emotions?
2. qualityScore (0-10): How well-structured and coherent is this conversation?
3. reasoning: Brief explanation for your scores, specifically mentioning what content you found or why it lacks personal/emotional content
4. category: "relevant" if relevancyScore >= 6, "not_relevant" if < 6

Please respond with only valid JSON in this format:
[{"relevancyScore": number, "qualityScore": number, "reasoning": "string", "category": "relevant"|"not_relevant"}]`;
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  /**
   * Get the current configuration (read-only)
   */
  getConfig(): Readonly<AIServiceConfig> {
    return { ...this.config };
  }
}
