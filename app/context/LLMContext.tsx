import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LLMService } from '../services/llm/LLMService';
import { OpenRouterAdapter } from '../services/llm/OpenRouterAdapter';
import { OllamaAdapter } from '../services/llm/OllamaAdapter';
import { LLMRequest, LLMResponse } from '../types';
import { useSecret } from './SecretContext';

// Define the context type
interface LLMContextType {
  providers: {
    openrouter: {
      service: LLMService;
      isAvailable: boolean;
      availableModels: string[];
      isLoading: boolean;
    };
    ollama: {
      service: LLMService;
      isAvailable: boolean;
      availableModels: string[];
      isLoading: boolean;
    };
  };
  activeProvider: 'openrouter' | 'ollama';
  setActiveProvider: (provider: 'openrouter' | 'ollama') => void;
  sendRequest: (request: LLMRequest) => Promise<LLMResponse>;
  isLoading: boolean;
  error: string | null;
  setOpenRouterApiKey: (apiKey: string) => void;
  setOllamaBaseUrl: (baseUrl: string) => void;
  refreshModels: () => Promise<void>;
}

// Create the context
const LLMContext = createContext<LLMContextType | undefined>(undefined);

// Create the provider component
interface LLMProviderProps {
  children: ReactNode;
}

export const LLMProvider: React.FC<LLMProviderProps> = ({ children }) => {
  // Use the SecretContext to get API keys
  const { secrets, environmentVariables } = useSecret();
  
  // Initialize services with empty values, will update after loading secrets
  const [openRouterService, setOpenRouterService] = useState<OpenRouterAdapter>(
    new OpenRouterAdapter('')
  );
  const [ollamaService, setOllamaService] = useState<OllamaAdapter>(
    new OllamaAdapter('http://localhost:11434')
  );
  
  // Check if we're in the browser
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // State for provider availability and models
  const [openRouterAvailable, setOpenRouterAvailable] = useState<boolean>(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean>(false);
  const [openRouterModels, setOpenRouterModels] = useState<string[]>([]);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [activeProvider, setActiveProvider] = useState<'openrouter' | 'ollama'>('openrouter');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load API keys from secrets
  useEffect(() => {
    // Find OpenRouter API key in secrets
    const openRouterSecret = secrets.find(secret => secret.name === 'OPENROUTER_API_KEY');
    if (openRouterSecret) {
      setOpenRouterApiKey(openRouterSecret.value);
    }
    
    // Check environment variables for Ollama base URL
    if (environmentVariables['OLLAMA_BASE_URL']) {
      setOllamaBaseUrl(environmentVariables['OLLAMA_BASE_URL']);
    } else {
      // Use default if not found
      setOllamaBaseUrl('http://localhost:11434');
    }
  }, [secrets, environmentVariables]);
  
  // Check availability and fetch models when services are updated
  useEffect(() => {
    if (isBrowser) {
      refreshModels();
    }
  }, [isBrowser, openRouterService, ollamaService]);
  
  // Refresh models and check availability
  const refreshModels = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check OpenRouter availability
      const openRouterAvailable = await openRouterService.isAvailable();
      setOpenRouterAvailable(openRouterAvailable);
      
      // Fetch OpenRouter models if available
      if (openRouterAvailable) {
        const models = await openRouterService.getAvailableModels();
        setOpenRouterModels(models);
      }
      
      // Check Ollama availability
      const ollamaAvailable = await ollamaService.isAvailable();
      setOllamaAvailable(ollamaAvailable);
      
      // Fetch Ollama models if available
      if (ollamaAvailable) {
        const models = await ollamaService.getAvailableModels();
        setOllamaModels(models);
      }
      
      // Set active provider based on availability
      if (activeProvider === 'openrouter' && !openRouterAvailable && ollamaAvailable) {
        setActiveProvider('ollama');
      } else if (activeProvider === 'ollama' && !ollamaAvailable && openRouterAvailable) {
        setActiveProvider('openrouter');
      }
    } catch (err) {
      console.error('Error refreshing LLM models:', err);
      setError('Failed to refresh LLM models');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set OpenRouter API key
  const setOpenRouterApiKey = (apiKey: string): void => {
    const newService = new OpenRouterAdapter(apiKey);
    setOpenRouterService(newService);
    
    // Refresh models with the new API key
    refreshModels();
  };
  
  // Set Ollama base URL
  const setOllamaBaseUrl = (baseUrl: string): void => {
    const newService = new OllamaAdapter(baseUrl);
    setOllamaService(newService);
    
    // Refresh models with the new base URL
    refreshModels();
  };
  
  // Send a request to the specified provider
  const sendRequest = async (request: LLMRequest): Promise<LLMResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the provider specified in the request, falling back to active provider if not specified
      const requestProvider = request.provider || activeProvider;
      
      // Get the appropriate service based on the request provider
      const service = requestProvider === 'openrouter' ? openRouterService : ollamaService;
      
      console.log('LLMContext sendRequest - Using provider:', requestProvider);
      console.log('LLMContext sendRequest - Model:', request.model);
      
      // Send the request
      const response = await service.sendRequest(request);
      return response;
    } catch (err) {
      console.error('Error sending LLM request:', err);
      setError('Failed to send LLM request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    providers: {
      openrouter: {
        service: openRouterService,
        isAvailable: openRouterAvailable,
        availableModels: openRouterModels,
        isLoading,
      },
      ollama: {
        service: ollamaService,
        isAvailable: ollamaAvailable,
        availableModels: ollamaModels,
        isLoading,
      },
    },
    activeProvider,
    setActiveProvider,
    sendRequest,
    isLoading,
    error,
    setOpenRouterApiKey,
    setOllamaBaseUrl,
    refreshModels,
  };
  
  return (
    <LLMContext.Provider value={value}>
      {children}
    </LLMContext.Provider>
  );
};

// Create a hook to use the LLM context
export const useLLM = () => {
  const context = useContext(LLMContext);
  if (context === undefined) {
    throw new Error('useLLM must be used within an LLMProvider');
  }
  return context;
};