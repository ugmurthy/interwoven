import { LLMRequest, LLMResponse } from '../../types';

/**
 * LLM Service Interface
 * Provides an abstraction layer for different LLM providers
 */
export interface LLMService {
  /**
   * Send a request to the LLM provider
   * @param request The LLM request
   * @returns A promise that resolves to the LLM response
   */
  sendRequest(request: LLMRequest): Promise<LLMResponse>;
  
  /**
   * Get available models from the provider
   * @returns A promise that resolves to an array of model names
   */
  getAvailableModels(): Promise<string[]>;
  
  /**
   * Check if the provider is available
   * @returns A promise that resolves to a boolean indicating if the provider is available
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Abstract base class for LLM service implementations
 */
export abstract class BaseLLMService implements LLMService {
  protected apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  abstract sendRequest(request: LLMRequest): Promise<LLMResponse>;
  abstract getAvailableModels(): Promise<string[]>;
  abstract isAvailable(): Promise<boolean>;
}