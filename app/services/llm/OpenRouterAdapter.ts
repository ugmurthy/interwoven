import { LLMRequest, LLMResponse, ToolResult } from '../../types';
import { BaseLLMService } from './LLMService';

/**
 * OpenRouter LLM Service Adapter
 * Implements the LLM service interface for OpenRouter
 */
export class OpenRouterAdapter extends BaseLLMService {
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string) {
    super(apiKey);
  }
  
  /**
   * Send a request to OpenRouter
   * @param request The LLM request
   * @returns A promise that resolves to the LLM response
   */
  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: request.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: request.prompt }
          ],
          ...request.parameters,
          tools: request.tools ? this.formatTools(request.tools) : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract tool results if any
      const toolResults: ToolResult[] = [];
      if (data.choices[0]?.message?.tool_calls) {
        for (const toolCall of data.choices[0].message.tool_calls) {
          try {
            toolResults.push({
              toolId: toolCall.id,
              result: JSON.parse(toolCall.function.arguments),
              mcpServerId: undefined,
            });
          } catch (error) {
            toolResults.push({
              toolId: toolCall.id,
              result: null,
              error: `Failed to parse tool arguments: ${error}`,
              mcpServerId: undefined,
            });
          }
        }
      }
      
      return {
        id: data.id,
        content: data.choices[0]?.message?.content || '',
        toolResults: toolResults.length > 0 ? toolResults : undefined,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        metadata: {
          model: data.model,
          systemFingerprint: data.system_fingerprint,
        },
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }
  
  /**
   * Get available models from OpenRouter
   * @returns A promise that resolves to an array of model names
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      return [];
    }
  }
  
  /**
   * Check if OpenRouter is available
   * @returns A promise that resolves to a boolean indicating if OpenRouter is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('OpenRouter availability check failed:', error);
      return false;
    }
  }
  
  /**
   * Format tools for OpenRouter API
   * @param tools The tools to format
   * @returns Formatted tools for OpenRouter API
   */
  private formatTools(tools: any[]): any[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.configuration,
      }
    }));
  }
}