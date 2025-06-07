import { v4 as uuidv4 } from 'uuid';
import { MCPServer } from '../../types';
import { MCPClientService } from './MCPClientService';
import { StorageService } from '../storage/StorageService';

/**
 * MCP Server Manager
 * Implements the MCP client service interface
 */
export class MCPServerManager implements MCPClientService {
  private storageService: StorageService;
  private storageKey: string = 'mcp-servers';
  
  /**
   * Create a new MCPServerManager
   * @param storageService The storage service to use
   */
  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }
  
  /**
   * Get all registered MCP servers
   * @returns A promise that resolves to an array of MCP servers
   */
  async getServers(): Promise<MCPServer[]> {
    const servers = await this.storageService.getItem<MCPServer[]>(this.storageKey);
    return servers || [];
  }
  
  /**
   * Get an MCP server by ID
   * @param id The ID of the MCP server
   * @returns A promise that resolves to the MCP server or null if not found
   */
  async getServer(id: string): Promise<MCPServer | null> {
    const servers = await this.getServers();
    return servers.find(server => server.id === id) || null;
  }
  
  /**
   * Add a new MCP server
   * @param server The MCP server to add
   * @returns A promise that resolves to the added MCP server
   */
  async addServer(server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<MCPServer> {
    const servers = await this.getServers();
    
    const newServer: MCPServer = {
      ...server,
      enabled: server.enabled ?? true, // Default to enabled if not specified
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(this.storageKey, [...servers, newServer]);
    
    return newServer;
  }
  
  /**
   * Update an existing MCP server
   * @param id The ID of the MCP server to update
   * @param server The updated MCP server data
   * @returns A promise that resolves to the updated MCP server
   */
  async updateServer(id: string, server: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MCPServer> {
    const servers = await this.getServers();
    const existingServer = servers.find(s => s.id === id);
    
    if (!existingServer) {
      throw new Error(`MCP server with ID ${id} not found`);
    }
    
    const updatedServer: MCPServer = {
      ...existingServer,
      ...server,
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(
      this.storageKey,
      servers.map(s => (s.id === id ? updatedServer : s))
    );
    
    return updatedServer;
  }
  
  /**
   * Remove an MCP server
   * @param id The ID of the MCP server to remove
   * @returns A promise that resolves when the server is removed
   */
  async removeServer(id: string): Promise<void> {
    const servers = await this.getServers();
    
    await this.storageService.setItem(
      this.storageKey,
      servers.filter(server => server.id !== id)
    );
  }
  
  /**
   * Toggle the enabled status of an MCP server
   * @param id The ID of the MCP server to toggle
   * @returns A promise that resolves to the updated MCP server
   */
  async toggleServerEnabled(id: string): Promise<MCPServer> {
    const servers = await this.getServers();
    const server = servers.find(s => s.id === id);
    
    if (!server) {
      throw new Error(`MCP server with ID ${id} not found`);
    }
    
    const updatedServer: MCPServer = {
      ...server,
      enabled: !server.enabled,
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(
      this.storageKey,
      servers.map(s => (s.id === id ? updatedServer : s))
    );
    
    return updatedServer;
  }
  
  /**
   * Call an MCP server tool
   * @param serverId The ID of the MCP server
   * @param toolName The name of the tool to call
   * @param args The arguments to pass to the tool
   * @returns A promise that resolves to the tool result
   */
  async callTool(serverId: string, toolName: string, args: Record<string, any>): Promise<any> {
    // This is a mock implementation
    // In a real implementation, this would use the MCP SDK to call the tool
    console.log(`Calling tool ${toolName} on server ${serverId} with args:`, args);
    
    // For now, just return a mock response
    return {
      success: true,
      result: `Mock result for tool ${toolName}`,
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Access an MCP server resource
   * @param serverId The ID of the MCP server
   * @param uri The URI of the resource to access
   * @returns A promise that resolves to the resource data
   */
  async accessResource(serverId: string, uri: string): Promise<any> {
    // This is a mock implementation
    // In a real implementation, this would use the MCP SDK to access the resource
    console.log(`Accessing resource ${uri} on server ${serverId}`);
    
    // For now, just return a mock response
    return {
      success: true,
      data: `Mock data for resource ${uri}`,
      timestamp: new Date().toISOString(),
    };
  }
}