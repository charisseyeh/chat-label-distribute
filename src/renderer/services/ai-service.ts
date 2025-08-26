import axios from 'axios';

export interface AIConversationSample {
  title: string;
  firstMessage: string;
}

export interface AIRelevancyResult {
  category: 'relevant' | 'not-relevant';
  explanation: string;
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

  async analyzeConversationRelevancy(
    conversationSamples: AIConversationSample[]
  ): Promise<AIRelevancyResult[]> {
    try {
      const requestBody = {
        model: this.config.model || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are helping to identify conversations that might be relevant for reflective or therapy-like conversations with ChatGPT. Look for conversations about personal growth, emotions, relationships, self-reflection, mental health, or similar topics. You must respond with ONLY a valid JSON array with exactly the same number of items as conversations provided, no other text."
          },
          {
            role: "user",
            content: `Analyze these ${conversationSamples.length} conversations and determine if each is relevant for reflective/therapy-like conversations with ChatGPT. Look for topics like personal growth, emotions, relationships, self-reflection, mental health, or similar.

For each conversation, I'll provide the title and a sample of the first user message (up to 400 characters).

IMPORTANT: You must respond with exactly ${conversationSamples.length} classifications in a JSON array, one for each conversation provided.

Each object must have exactly these fields:
- "category": either "relevant" or "not-relevant"
- "explanation": a brief reason for the classification

Example format:
[{"category": "relevant", "explanation": "This appears to be about personal relationships"}, {"category": "not-relevant", "explanation": "This is about technical programming"}]

Conversations to analyze:

${conversationSamples.map((sample, index) => 
  `${index + 1}. Title: "${sample.title}"\n   First Message: "${sample.firstMessage.substring(0, 400)}${sample.firstMessage.length > 400 ? '...' : ''}"`
).join('\n\n')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      };

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI API');
      }

      // Parse the JSON response
      const results = JSON.parse(content);
      
      // Validate the response format
      if (!Array.isArray(results) || results.length !== conversationSamples.length) {
        throw new Error('Invalid response format from OpenAI API');
      }

      // Validate each result
      for (const result of results) {
        if (!result.category || !result.explanation) {
          throw new Error('Invalid result format from OpenAI API');
        }
        if (!['relevant', 'not-relevant'].includes(result.category)) {
          throw new Error('Invalid category value from OpenAI API');
        }
      }

      return results;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status && error.response.status >= 500) {
          throw new Error('OpenAI service is currently unavailable. Please try again later.');
        } else {
          throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
        }
      } else if (error instanceof SyntaxError) {
        throw new Error('Invalid response format from OpenAI API. Please try again.');
      } else {
        throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}
