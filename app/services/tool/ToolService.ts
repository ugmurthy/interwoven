import { Tool, ToolResponse } from '../../types';

/**
 * Tool Service Interface
 * Provides functionality for executing tools
 */
export interface ToolService {
  /**
   * Execute a tool
   * @param tool The tool to execute
   * @param args The arguments to pass to the tool
   * @returns A promise that resolves to the tool response
   */
  executeTool(tool: Tool, args: Record<string, any>): Promise<ToolResponse>;
  
  /**
   * Get available tools
   * @returns A promise that resolves to an array of available tools
   */
  getAvailableTools(): Promise<Tool[]>;
  
  /**
   * Validate tool capabilities
   * @param tool The tool to validate
   * @returns A promise that resolves to a boolean indicating if the tool is valid
   */
  validateTool(tool: Tool): Promise<boolean>;
  
  /**
   * Get tool schema
   * @param tool The tool to get the schema for
   * @returns A promise that resolves to the tool schema
   */
  getToolSchema(tool: Tool): Promise<Record<string, any>>;
}

/**
 * Abstract base class for tool service implementations
 */
export abstract class BaseToolService implements ToolService {
  abstract executeTool(tool: Tool, args: Record<string, any>): Promise<ToolResponse>;
  abstract getAvailableTools(): Promise<Tool[]>;
  abstract validateTool(tool: Tool): Promise<boolean>;
  abstract getToolSchema(tool: Tool): Promise<Record<string, any>>;
}