// Core type definitions for the Model Card Application

// Model Card Types
export interface ModelCard {
  id: string;
  name: string;
  description: string;
  systemPrompt: string; // Add this field
  parameters: Parameter[];
  inputConnections: Connection[];
  outputConnections: Connection[];
  llmProvider: 'openrouter' | 'ollama';
  llmModel: string;
  capabilities: ModelCapabilities;
  mcpServers?: string[]; // IDs of connected MCP servers
  settings?: Record<string, any>; // Add this field for settings JSON object
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelCapabilities {
  supportsImages: boolean;
  supportsAudio: boolean;
  supportsFiles: boolean;
  supportsTools: boolean;
  supportedToolTypes: string[];
}

export interface Parameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  value: any;
  options?: string[]; // For select type
  description?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'model-to-model' | 'input-to-model' | 'model-to-output';
}

// Input Types
export interface Input {
  id: string;
  type: 'text' | 'file' | 'audio' | 'tool';
  content: string | File | AudioBuffer | Tool;
  metadata: Record<string, any>;
}

export interface Tool {
  id: string;
  name: string;
  type: 'mcp' | 'custom';
  mcpServerId?: string; // ID of the MCP server providing this tool
  configuration: Record<string, any>;
  description?: string;
}

// Output Types
export interface Output {
  id: string;
  type: 'text' | 'markdown';
  content: string;
  toolResponses?: ToolResponse[];
  usageStatistics: UsageStatistics;
  metadata: Record<string, any>;
}

export interface ToolResponse {
  toolId: string;
  toolName: string;
  mcpServerId?: string; // ID of the MCP server that processed the tool
  response: any;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
}

export interface UsageStatistics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  executionTime: number;
  toolCalls: number;
}

// LLM Request/Response Types
export interface LLMRequest {
  provider: 'openrouter' | 'ollama';
  model: string;
  prompt: string;
  parameters: Record<string, any>;
  tools?: Tool[];
  files?: File[];
}

export interface LLMResponse {
  id: string;
  content: string;
  toolResults?: ToolResult[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: Record<string, any>;
}

export interface ToolResult {
  toolId: string;
  mcpServerId?: string;
  result: any;
  error?: string;
}

// MCP Server Types
export interface MCPServer {
  id: string;
  name: string;
  settings: Record<string, any>;
  enabled: boolean; // Add this field
  createdAt: Date;
  updatedAt: Date;
}

// Workflow Execution Types
export interface ExecutionResult {
  modelId: string;
  modelName: string;
  input: string;
  output: string;
  usageStatistics: UsageStatistics;
  timestamp: Date;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  workflowName: string;
  results: ExecutionResult[];
  finalOutput: string;
  totalUsageStatistics: UsageStatistics;
  startTime: Date;
  endTime: Date;
}