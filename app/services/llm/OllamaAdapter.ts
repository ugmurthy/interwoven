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
      // Format parameters for Ollama API
      // Ollama expects options to be properly typed
      const options: Record<string, any> = {};
      
      // Process parameters and ensure they have the correct types
      if (request.parameters) {
        Object.entries(request.parameters).forEach(([key, value]) => {
          // Convert string values to appropriate types if needed
          if (typeof value === 'string') {
            // Try to convert to number if it looks like a number
            if (!isNaN(Number(value)) && value.trim() !== '') {
              options[key] = Number(value);
            }
            // Try to convert to boolean if it's 'true' or 'false'
            else if (value.toLowerCase() === 'true') {
              options[key] = true;
            }
            else if (value.toLowerCase() === 'false') {
              options[key] = false;
            }
            // Otherwise keep as string
            else {
              options[key] = value;
            }
          } else {
            // Keep non-string values as is
            options[key] = value;
          }
        });
      }
      
      // Extract system prompt and user prompt from the combined prompt
      // The format is expected to be: [system prompt]\n\n[user prompt]
      let systemPrompt = 'You are a helpful assistant.';
      let userPrompt = request.prompt;
      
      // Check if the prompt contains a system prompt
      const promptParts = request.prompt.split('\n\n');
      if (promptParts.length > 1) {
        systemPrompt = promptParts[0];
        userPrompt = promptParts.slice(1).join('\n\n');
      }
      
      console.log('Ollama sendRequest - System prompt:', systemPrompt);
      console.log('Ollama sendRequest - User prompt:', userPrompt);
      
      const requestBody = {
        model: request.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        options: options,
        stream: false,
      };
      
      console.log('Ollama sendRequest - URL:', `${this.baseUrl}/api/chat`);
      console.log('Ollama sendRequest - Request body:', requestBody);
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Ollama sendRequest - Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Ollama sendRequest - Response data:', data);
      
      // Handle different response formats from Ollama API
      let content = '';
      
      // Check different possible response formats
      if (data.message && data.message.content) {
        // Format: { message: { content: "..." } }
        content = data.message.content;
      } else if (data.response) {
        // Format: { response: "..." }
        content = data.response;
      } else if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        // Format: { choices: [{ message: { content: "..." } }] }
        content = data.choices[0].message.content;
      } else {
        console.error('Ollama sendRequest - Unexpected response format:', data);
        content = 'Error: Unexpected response format from Ollama API';
      }
      
      // Ollama doesn't provide token counts, so we'll estimate
      const promptTokens = Math.ceil(request.prompt.length / 4);
      const completionTokens = Math.ceil(content.length / 4);
      
      return {
        id: `ollama-${Date.now()}`,
        content: content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        metadata: {
          model: request.model,
          rawResponse: data // Include the raw response for debugging
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
      console.log('Ollama getAvailableModels - URL:', `${this.baseUrl}/api/tags`);
      
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      console.log('Ollama getAvailableModels - Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Ollama getAvailableModels - Response data:', data);
      
      // Handle different response formats
      if (data.models && Array.isArray(data.models)) {
        // Format: { models: [{ name: "..." }, ...] }
        return data.models.map((model: any) => model.name || model.id || String(model));
      } else if (data.data && Array.isArray(data.data)) {
        // Format: { data: [{ name: "..." }, ...] }
        return data.data.map((model: any) => model.name || model.id || String(model));
      } else if (Array.isArray(data)) {
        // Format: [{ name: "..." }, ...]
        return data.map((model: any) => model.name || model.id || String(model));
      } else {
        console.error('Ollama getAvailableModels - Unexpected response format:', data);
        // Try to extract any model information we can find
        const models: string[] = [];
        if (typeof data === 'object' && data !== null) {
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item: any) => {
                if (item && typeof item === 'object' && (item.name || item.id)) {
                  models.push(item.name || item.id);
                }
              });
            }
          });
        }
        return models;
      }
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
      console.log('Ollama isAvailable - URL:', `${this.baseUrl}/api/tags`);
      
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      console.log('Ollama isAvailable - Response status:', response.status, response.statusText);
      
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