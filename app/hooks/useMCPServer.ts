import { useState, useEffect, useCallback } from 'react';
import { useMCP } from '../context/MCPContext';
import { Tool, ModelCard, MCPServer } from '../types';

/**
 * Hook for integrating MCP servers with model cards
 */
export function useMCPServer(modelCard?: ModelCard) {
  const { 
    servers, 
    getServerTools, 
    callTool, 
    testServerConnection 
  } = useMCP();
  
  const [connectedServers, setConnectedServers] = useState<string[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize connected servers from model card
  useEffect(() => {
    if (modelCard?.mcpServers) {
      setConnectedServers(modelCard.mcpServers);
    } else {
      setConnectedServers([]);
    }
  }, [modelCard]);
  
  // Load available tools from connected servers
  useEffect(() => {
    const loadTools = async () => {
      if (!connectedServers.length) {
        setAvailableTools([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const tools: Tool[] = [];
        
        for (const serverId of connectedServers) {
          // Skip servers that don't exist
          const server = servers.find(s => s.id === serverId);
          if (!server) continue;
          
          // Skip disabled servers
          if (!server.enabled) continue;
          
          // Get tools for this server
          const serverTools = await getServerTools(serverId);
          tools.push(...serverTools);
        }
        
        setAvailableTools(tools);
      } catch (err) {
        console.error('Error loading MCP tools:', err);
        setError('Failed to load MCP tools');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTools();
  }, [connectedServers, servers, getServerTools]);
  
  /**
   * Connect a model card to an MCP server
   * @param serverId The ID of the server to connect
   * @returns A promise that resolves to the updated connected servers
   */
  const connectServer = useCallback(async (serverId: string): Promise<string[]> => {
    // Check if server exists
    const server = servers.find(s => s.id === serverId);
    if (!server) {
      throw new Error(`MCP server with ID ${serverId} not found`);
    }
    
    // Check if server is already connected
    if (connectedServers.includes(serverId)) {
      return connectedServers;
    }
    
    // Test connection before connecting
    const isConnected = await testServerConnection(serverId);
    if (!isConnected) {
      throw new Error(`Failed to connect to MCP server ${server.name}`);
    }
    
    // Add server to connected servers
    const updatedServers = [...connectedServers, serverId];
    setConnectedServers(updatedServers);
    return updatedServers;
  }, [connectedServers, servers, testServerConnection]);
  
  /**
   * Disconnect a model card from an MCP server
   * @param serverId The ID of the server to disconnect
   * @returns A promise that resolves to the updated connected servers
   */
  const disconnectServer = useCallback((serverId: string): string[] => {
    // Remove server from connected servers
    const updatedServers = connectedServers.filter(id => id !== serverId);
    setConnectedServers(updatedServers);
    return updatedServers;
  }, [connectedServers]);
  
  /**
   * Execute a tool on an MCP server
   * @param tool The tool to execute
   * @param args The arguments to pass to the tool
   * @returns A promise that resolves to the tool result
   */
  const executeTool = useCallback(async (tool: Tool, args: Record<string, any>): Promise<any> => {
    if (tool.type !== 'mcp' || !tool.mcpServerId) {
      throw new Error('Tool is not an MCP tool');
    }
    
    // Check if server is connected
    if (!connectedServers.includes(tool.mcpServerId)) {
      throw new Error(`MCP server ${tool.mcpServerId} is not connected to this model card`);
    }
    
    // Call the tool
    return callTool(tool.mcpServerId, tool.name, { ...tool.configuration, ...args });
  }, [connectedServers, callTool]);
  
  /**
   * Get available tools for a specific type
   * @param toolType The type of tools to get
   * @returns An array of tools of the specified type
   */
  const getToolsByType = useCallback((toolType: string): Tool[] => {
    return availableTools.filter(tool => {
      // For now, we don't have a way to determine tool type from the mock data
      // In a real implementation, this would filter tools by type
      return true;
    });
  }, [availableTools]);
  
  /**
   * Get connected server details
   * @returns An array of connected server objects
   */
  const getConnectedServerDetails = useCallback(() => {
    return connectedServers
      .map(id => servers.find(s => s.id === id))
      .filter((server): server is MCPServer => !!server)
      .map(server => ({
        id: server.id,
        name: server.name,
        enabled: server.enabled,
      }));
  }, [connectedServers, servers]);
  
  return {
    connectedServers,
    availableTools,
    isLoading,
    error,
    connectServer,
    disconnectServer,
    executeTool,
    getToolsByType,
    getConnectedServerDetails,
  };
}