import { useState, useCallback } from 'react';

export const useAIConfiguration = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');

  const validateConfiguration = useCallback(() => {
    if (!apiKey.trim()) {
      throw new Error('Please enter an OpenAI API key');
    }
    
    const cleanApiKey = apiKey.trim();
    
    if (!cleanApiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. API key should start with "sk-"');
    }
    
    return { apiKey: cleanApiKey, model };
  }, [apiKey, model]);

  const resetConfiguration = () => {
    setApiKey('');
    setModel('gpt-4o');
  };

  return {
    apiKey,
    model,
    setApiKey,
    setModel,
    validateConfiguration,
    resetConfiguration
  };
};
