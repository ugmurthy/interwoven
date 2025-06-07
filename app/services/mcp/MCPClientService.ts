import { MCPServer } from '../../types';

/**
 * MCP Client Service Interface
 * Provides functionality for interacting with MCP servers
 */
export interface MCPClientService {
  /**
   * Get all registered MCP servers
   * @returns A promise that resolves to an array of MCP servers
   */
  getServers(): Promise<MCPServer[]>;
  
  /**
   * Get an MCP server by ID
   * @param id The ID of the MCP server
   * @returns A promise that resolves to the MCP server or null if not found
   */
  getServer(id: string): Promise<MCPServer | null>;
  
  /**
   * Add a new MCP server
   * @param server The MCP server to add
   * @returns A promise that resolves to the added MCP server
   */
  addServer(server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<MCPServer>;
  
  /**
   * Update an existing MCP server
   * @param id The ID of the MCP server to update
   * @param server The updated MCP server data
   * @returns A promise that resolves to the updated MCP server
   */
  updateServer(id: string, server: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MCPServer>;
  
  /**
   * Remove an MCP server
   * @param id The ID of the MCP server to remove
   * @returns A promise that resolves when the server is removed
   */
  removeServer(id: string): Promise<void>;
  
  /**
   * Toggle the enabled status of an MCP server
   * @param id The ID of the MCP server to toggle
   * @returns A promise that resolves to the updated MCP server
   */
  toggleServerEnabled(id: string): Promise<MCPServer>;
  
  /**
   * Call an MCP server tool
   * @param serverId The ID of the MCP server
   * @param toolName The name of the tool to call
   * @param args The arguments to pass to the tool
   * @returns A promise that resolves to the tool result
   */
  callTool(serverId: string, toolName: string, args: Record<string, any>): Promise<any>;
  
  /**
   * Access an MCP server resource
   * @param serverId The ID of the MCP server
   * @param uri The URI of the resource to access
   * @returns A promise that resolves to the resource data
   */
  accessResource(serverId: string, uri: string): Promise<any>;
}