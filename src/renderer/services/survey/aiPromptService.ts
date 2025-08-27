import { SurveyTemplate, AIPromptConfig } from '../../types/survey';

export class AIPromptService {
  /**
   * Generates AI prompt configuration from survey template
   */
  static generatePromptConfig(
    template: SurveyTemplate,
    conversationContext: string,
    position: 'beginning' | 'turn6' | 'end'
  ): AIPromptConfig {
    const positionQuestions = template.questions.map(question => ({
      id: question.id,
      text: question.text,
      scale: question.scale,
      labels: question.labels,
      position
    }));

    const ratingInstructions = this.generateRatingInstructions(template, position);

    return {
      templateId: template.id,
      questions: positionQuestions,
      conversationContext,
      ratingInstructions
    };
  }

  /**
   * Generates rating instructions for AI
   */
  static generateRatingInstructions(template: SurveyTemplate, position: 'beginning' | 'turn6' | 'end'): string {
    const positionText = this.getPositionText(position);
    
    let instructions = `You are analyzing a conversation for psychological assessment. `;
    instructions += `Please rate the following questions based on the conversation content at the ${positionText}.\n\n`;
    
    instructions += `Rating Instructions:\n`;
    instructions += `- Each question has a specific rating scale\n`;
    instructions += `- Use only the numeric values provided in the scale\n`;
    instructions += `- Consider the context and timing of the conversation\n`;
    instructions += `- Provide only the numeric rating, no explanations\n\n`;
    
    instructions += `Questions to rate:\n`;
    
    template.questions.forEach((question, index) => {
      const scaleRange = `1-${question.scale}`;
      const labelText = Object.entries(question.labels)
        .map(([rating, label]) => `${rating}=${label}`)
        .join(', ');
      
      instructions += `${index + 1}. ${question.text}\n`;
      instructions += `   Scale: ${scaleRange}\n`;
      instructions += `   Labels: ${labelText}\n\n`;
    });
    
    instructions += `Please provide your ratings in the following format:\n`;
    instructions += `Question 1: [rating]\n`;
    instructions += `Question 2: [rating]\n`;
    instructions += `...\n`;
    instructions += `Question ${template.questions.length}: [rating]`;
    
    return instructions;
  }

  /**
   * Generates the complete AI prompt for OpenAI API
   */
  static generateOpenAIPrompt(
    template: SurveyTemplate,
    conversationContext: string,
    position: 'beginning' | 'turn6' | 'end'
  ): string {
    console.log('🔍 Generating AI prompt with template:', template);
    console.log('🔍 Template questions:', template.questions);
    
    const systemPrompt = this.generateSystemPrompt(template, position);
    const userPrompt = this.generateUserPrompt(template, conversationContext, position);
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    console.log('🔍 Generated full prompt:', fullPrompt);
    
    return fullPrompt;
  }

  /**
   * Generates system prompt for OpenAI API
   */
  private static generateSystemPrompt(template: SurveyTemplate, position: 'beginning' | 'turn6' | 'end'): string {
    const positionText = this.getPositionText(position);
    
    console.log('🔍 Generating system prompt for template with questions:', template.questions.length);
    
    let prompt = `You are an expert psychological assessor analyzing conversations. `;
    prompt += `Your task is to rate psychological dimensions based on the conversation content at the ${positionText}.\n\n`;
    
    prompt += `You must:\n`;
    prompt += `- Analyze the emotional and psychological state of the conversation participants\n`;
    prompt += `- Use only the provided rating scales\n`;
    prompt += `- Provide ratings that reflect the psychological assessment\n`;
    prompt += `- Be consistent and objective in your ratings\n`;
    prompt += `- Consider the context and timing of the conversation\n\n`;
    
    prompt += `Rating Format:\n`;
    template.questions.forEach((question, index) => {
      const scaleRange = `1-${question.scale}`;
      const labelText = Object.entries(question.labels)
        .map(([rating, label]) => `${rating}=${label}`)
        .join(', ');
      
      console.log(`🔍 Question ${index + 1}: ${question.text} (Scale: ${scaleRange}, Labels: ${labelText})`);
      
      prompt += `Question ${index + 1}: ${question.text}\n`;
      prompt += `   Scale: ${scaleRange}\n`;
      prompt += `   Labels: ${labelText}\n\n`;
    });
    
    console.log('🔍 Generated system prompt:', prompt);
    return prompt;
  }

  /**
   * Generates user prompt for OpenAI API
   */
  private static generateUserPrompt(template: SurveyTemplate, conversationContext: string, position: 'beginning' | 'turn6' | 'end'): string {
    const positionText = this.getPositionText(position);
    
    let prompt = `Please analyze the following conversation and provide psychological ratings for the ${positionText}.\n\n`;
    prompt += `Conversation Context:\n${conversationContext}\n\n`;
    
    prompt += `Please provide your ratings in this exact format:\n`;
    // Dynamically generate the format based on actual template questions
    template.questions.forEach((question, index) => {
      prompt += `Question ${index + 1}: [rating]\n`;
    });
    
    return prompt;
  }

  /**
   * Parses AI response to extract ratings
   */
  static parseAIResponse(response: string, template: SurveyTemplate): Record<string, number> {
    console.log('🔍 Parsing AI response:', response);
    console.log('🔍 Template questions:', template.questions);
    
    const ratings: Record<string, number> = {};
    
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 Found JSON match:', jsonMatch[0]);
        const jsonResponse = JSON.parse(jsonMatch[0]);
        console.log('🔍 Parsed JSON:', jsonResponse);
        template.questions.forEach(question => {
          if (jsonResponse[question.id] !== undefined) {
            ratings[question.id] = parseInt(jsonResponse[question.id]);
          }
        });
        console.log('🔍 Extracted ratings from JSON:', ratings);
        return ratings;
      }
      
      // Parse line-by-line format
      const lines = response.split('\n').filter(line => line.trim());
      console.log('🔍 Parsing lines:', lines);
      
      lines.forEach(line => {
        const match = line.match(/Question\s+(\d+):\s*(\d+)/i);
        if (match) {
          const questionIndex = parseInt(match[1]) - 1;
          const rating = parseInt(match[2]);
          
          console.log(`🔍 Matched Question ${questionIndex + 1}: ${rating}`);
          
          if (questionIndex >= 0 && questionIndex < template.questions.length) {
            const question = template.questions[questionIndex];
            ratings[question.id] = rating;
            console.log(`🔍 Added rating for ${question.id}: ${rating}`);
          }
        }
      });
      
      // Alternative format: "Question ID: rating"
      if (Object.keys(ratings).length === 0) {
        console.log('🔍 Trying alternative format parsing...');
        lines.forEach(line => {
          const parts = line.split(':').map(part => part.trim());
          if (parts.length === 2) {
            const questionId = parts[0];
            const rating = parseInt(parts[1]);
            
            console.log(`🔍 Alternative format - Question ID: ${questionId}, Rating: ${rating}`);
            
            if (template.questions.some(q => q.id === questionId) && !isNaN(rating)) {
              ratings[questionId] = rating;
              console.log(`🔍 Added rating for ${questionId}: ${rating}`);
            }
          }
        });
      }
      
      console.log('🔍 Final extracted ratings:', ratings);
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    
    return ratings;
  }

  /**
   * Validates AI response ratings
   */
  static validateAIRatings(ratings: Record<string, number>, template: SurveyTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    template.questions.forEach(question => {
      const rating = ratings[question.id];
      
      if (rating === undefined || rating === null) {
        errors.push(`Missing rating for question: ${question.text}`);
      } else if (rating < 1 || rating > question.scale) {
        errors.push(`Invalid rating ${rating} for question "${question.text}". Must be between 1 and ${question.scale}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets human-readable position text
   */
  private static getPositionText(position: 'beginning' | 'turn6' | 'end'): string {
    switch (position) {
      case 'beginning':
        return 'beginning (pre-conversation state)';
      case 'turn6':
        return 'middle (after 6th message exchange)';
      case 'end':
        return 'end (post-conversation state)';
      default:
        return position;
    }
  }

  /**
   * Generates conversation context summary for AI
   */
  static generateConversationContext(messages: any[], position: 'beginning' | 'turn6' | 'end'): string {
    let context = '';
    
    switch (position) {
      case 'beginning':
        // For beginning, show first few messages
        const beginningMessages = messages.slice(0, 3);
        context = `Conversation beginning:\n${beginningMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
        break;
        
      case 'turn6':
        // For turn 6, show messages around the 6th exchange
        const startIndex = Math.max(0, 10);
        const endIndex = Math.min(messages.length, 15);
        const turn6Messages = messages.slice(startIndex, endIndex);
        context = `Conversation around turn 6:\n${turn6Messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
        break;
        
      case 'end':
        // For end, show last few messages
        const endMessages = messages.slice(-3);
        context = `Conversation end:\n${endMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
        break;
    }
    
    return context;
  }
}
