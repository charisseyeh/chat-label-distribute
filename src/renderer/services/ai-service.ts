

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
      
      const response = await (window as any).electronAPI.callOpenAIAPI({
        apiKey: this.config.apiKey,
        model: this.config.model,
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
            category: 'relevant', // Default category
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
    return `Please analyze the following conversation excerpt and provide a JSON response with:
1. relevancyScore (0-10): How relevant is this conversation for research purposes?
2. qualityScore (0-10): How well-structured and coherent is this conversation?
3. reasoning: Brief explanation for your scores

Conversation excerpt:
${sample.conversationPreview || sample.firstMessage}

Please respond with only valid JSON in this format:
[{"relevancyScore": number, "qualityScore": number, "reasoning": "string"}]`;
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
