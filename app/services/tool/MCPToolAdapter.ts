import { Tool, ToolResponse } from '../../types';
import { BaseToolService } from './ToolService';
import { MCPClientService } from '../mcp/MCPClientService';

/**
 * MCP Tool Adapter
 * Implements the tool service interface for MCP tools
 */
export class MCPToolAdapter extends BaseToolService {
  private mcpClientService: MCPClientService;
  
  /**
   * Create a new MCPToolAdapter
   * @param mcpClientService The MCP client service to use
   */
  constructor(mcpClientService: MCPClientService) {
    super();
    this.mcpClientService = mcpClientService;
  }
  
  /**
   * Execute an MCP tool
   * @param tool The tool to execute
   * @param args The arguments to pass to the tool
   * @returns A promise that resolves to the tool response
   */
  async executeTool(tool: Tool, args: Record<string, any>): Promise<ToolResponse> {
    try {
      // Ensure the tool is an MCP tool
      if (tool.type !== 'mcp' || !tool.mcpServerId) {
        throw new Error('Tool is not an MCP tool');
      }
      
      // Call the MCP tool
      const result = await this.mcpClientService.callTool(
        tool.mcpServerId,
        tool.name,
        { ...tool.configuration, ...args }
      );
      
      // Return the tool response
      return {
        toolId: tool.id,
        toolName: tool.name,
        mcpServerId: tool.mcpServerId,
        response: result,
        timestamp: new Date(),
        status: 'success',
      };
    } catch (error) {
      console.error('Error executing MCP tool:', error);
      
      // Return an error response
      return {
        toolId: tool.id,
        toolName: tool.name,
        mcpServerId: tool.mcpServerId,
        response: null,
        timestamp: new Date(),
        status: 'error',
      };
    }
  }
  
  /**
   * Get available MCP tools
   * @returns A promise that resolves to an array of available MCP tools
   */
  async getAvailableTools(): Promise<Tool[]> {
    try {
      // Get all MCP servers
      const servers = await this.mcpClientService.getServers();
      
      // Filter out disabled servers
      const enabledServers = servers.filter(server => server.enabled);
      
      // This is a mock implementation
      // In a real implementation, this would query each MCP server for its available tools
      const mockTools: Tool[] = enabledServers.flatMap(server => [
        {
          id: `${server.id}-web-search`,
          name: 'web-search',
          type: 'mcp',
          mcpServerId: server.id,
          configuration: {
            query: '',
            maxResults: 5,
          },
          description: 'Search the web for information',
        },
        {
          id: `${server.id}-calculator`,
          name: 'calculator',
          type: 'mcp',
          mcpServerId: server.id,
          configuration: {
            expression: '',
          },
          description: 'Perform mathematical calculations',
        },
      ]);
      
      return mockTools;
    } catch (error) {
      console.error('Error getting available MCP tools:', error);
      return [];
    }
  }
  
  /**
   * Validate an MCP tool
   * @param tool The tool to validate
   * @returns A promise that resolves to a boolean indicating if the tool is valid
   */
  async validateTool(tool: Tool): Promise<boolean> {
    try {
      // Ensure the tool is an MCP tool
      if (tool.type !== 'mcp' || !tool.mcpServerId) {
        return false;
      }
      
      // Check if the MCP server exists and is enabled
      const server = await this.mcpClientService.getServer(tool.mcpServerId);
      if (!server || !server.enabled) {
        return false;
      }
      
      // This is a mock implementation
      // In a real implementation, this would validate the tool with the MCP server
      return true;
    } catch (error) {
      console.error('Error validating MCP tool:', error);
      return false;
    }
  }
  
  /**
   * Get MCP tool schema
   * @param tool The tool to get the schema for
   * @returns A promise that resolves to the tool schema
   */
  async getToolSchema(tool: Tool): Promise<Record<string, any>> {
    try {
      // Ensure the tool is an MCP tool
      if (tool.type !== 'mcp' || !tool.mcpServerId) {
        throw new Error('Tool is not an MCP tool');
      }
      
      // This is a mock implementation
      // In a real implementation, this would get the schema from the MCP server
      const mockSchemas: Record<string, Record<string, any>> = {
        'web-search': {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5,
            },
          },
          required: ['query'],
        },
        'calculator': {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'The mathematical expression to evaluate',
            },
          },
          required: ['expression'],
        },
      };
      
      return mockSchemas[tool.name] || {};
    } catch (error) {
      console.error('Error getting MCP tool schema:', error);
      return {};
    }
  }
}