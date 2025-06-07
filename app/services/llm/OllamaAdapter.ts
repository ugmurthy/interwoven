import { LLMRequest, LLMResponse } from '../../types';
import { BaseLLMService } from './LLMService';

/**
 * Ollama LLM Service Adapter
 * Implements the LLM service interface for Ollama
 */
export class OllamaAdapter extends BaseLLMService {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:11434', apiKey: string = '') {
    super(apiKey);
    this.baseUrl = baseUrl;
  }
  
  /**
   * Send a request to Ollama
   * @param request The LLM request
   * @returns A promise that resolves to the LLM response
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: request.prompt }
          ],
          options: request.parameters,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ollama doesn't provide token counts, so we'll estimate
      const promptTokens = Math.ceil(request.prompt.length / 4);
      const completionTokens = Math.ceil((data.message?.content || '').length / 4);
      
      return {
        id: `ollama-${Date.now()}`,
        content: data.message?.content || '',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        metadata: {
          model: request.model,
        },
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }
  
  /**
   * Get available models from Ollama
   * @returns A promise that resolves to an array of model names
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.models.map((model: any) => model.name);
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return [];
    }
  }
  
  /**
   * Check if Ollama is available
   * @returns A promise that resolves to a boolean indicating if Ollama is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama availability check failed:', error);
      return false;
    }
  }
  
  /**
   * Set the base URL for the Ollama API
   * @param baseUrl The base URL for the Ollama API
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }
}