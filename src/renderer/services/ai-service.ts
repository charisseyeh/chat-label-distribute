import axios from 'axios';

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
  model?: string;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
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

  private async analyzeSingleConversation(sample: AIConversationSample): Promise<AIRelevancyResult> {
    try {
      const prompt = this.buildAnalysisPrompt(sample);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing conversation quality and relevance for research purposes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.choices && response.data.choices[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        
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
      } else {
        throw new Error('No valid response from AI service');
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
}
