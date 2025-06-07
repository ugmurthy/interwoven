import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MCPServer, Tool } from '../types';
import { MCPClientService } from '../services/mcp/MCPClientService';

// Define the context type
interface MCPContextType {
  servers: MCPServer[];
  isLoading: boolean;
  error: string | null;
  refreshServers: () => Promise<void>;
  addServer: (server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MCPServer>;
  updateServer: (id: string, server: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<MCPServer>;
  removeServer: (id: string) => Promise<void>;
  toggleServerEnabled: (id: string) => Promise<MCPServer>;
  getServerTools: (serverId: string) => Promise<Tool[]>;
  testServerConnection: (serverId: string) => Promise<boolean>;
  callTool: (serverId: string, toolName: string, args: Record<string, any>) => Promise<any>;
}

// Create the context
const MCPContext = createContext<MCPContextType | undefined>(undefined);

// Create the provider component
interface MCPProviderProps {
  children: ReactNode;
  mcpClientService: MCPClientService;
}

export const MCPProvider: React.FC<MCPProviderProps> = ({ children, mcpClientService }) => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load servers on mount
  useEffect(() => {
    refreshServers();
  }, []);

  // Refresh the list of servers
  const refreshServers = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const serverList = await mcpClientService.getServers();
      setServers(serverList);
    } catch (err) {
      setError('Failed to load MCP servers');
      console.error('Error loading MCP servers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new server
  const addServer = async (server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<MCPServer> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newServer = await mcpClientService.addServer(server);
      setServers(prev => [...prev, newServer]);
      return newServer;
    } catch (err) {
      setError('Failed to add MCP server');
      console.error('Error adding MCP server:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing server
  const updateServer = async (
    id: string, 
    server: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<MCPServer> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedServer = await mcpClientService.updateServer(id, server);
      setServers(prev => prev.map(s => s.id === id ? updatedServer : s));
      return updatedServer;
    } catch (err) {
      setError(`Failed to update MCP server ${id}`);
      console.error(`Error updating MCP server ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a server
  const removeServer = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mcpClientService.removeServer(id);
      setServers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(`Failed to remove MCP server ${id}`);
      console.error(`Error removing MCP server ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle server enabled status
  const toggleServerEnabled = async (id: string): Promise<MCPServer> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedServer = await mcpClientService.toggleServerEnabled(id);
      setServers(prev => prev.map(s => s.id === id ? updatedServer : s));
      return updatedServer;
    } catch (err) {
      setError(`Failed to toggle MCP server ${id}`);
      console.error(`Error toggling MCP server ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get tools for a specific server
  const getServerTools = async (serverId: string): Promise<Tool[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation
      // In a real implementation, this would query the MCP server for its available tools
      const server = servers.find(s => s.id === serverId);
      
      if (!server) {
        throw new Error(`MCP server ${serverId} not found`);
      }
      
      if (!server.enabled) {
        throw new Error(`MCP server ${serverId} is disabled`);
      }
      
      // Mock tools
      const mockTools: Tool[] = [
        {
          id: `${serverId}-web-search`,
          name: 'web-search',
          type: 'mcp',
          mcpServerId: serverId,
          configuration: {
            query: '',
            maxResults: 5,
          },
          description: 'Search the web for information',
        },
        {
          id: `${serverId}-calculator`,
          name: 'calculator',
          type: 'mcp',
          mcpServerId: serverId,
          configuration: {
            expression: '',
          },
          description: 'Perform mathematical calculations',
        },
      ];
      
      return mockTools;
    } catch (err) {
      setError(`Failed to get tools for MCP server ${serverId}`);
      console.error(`Error getting tools for MCP server ${serverId}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Test server connection
  const testServerConnection = async (serverId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation
      // In a real implementation, this would test the connection to the MCP server
      const server = servers.find(s => s.id === serverId);
      
      if (!server) {
        throw new Error(`MCP server ${serverId} not found`);
      }
      
      // Simulate a connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (err) {
      setError(`Failed to test connection to MCP server ${serverId}`);
      console.error(`Error testing connection to MCP server ${serverId}:`, err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Call a tool on a server
  const callTool = async (serverId: string, toolName: string, args: Record<string, any>): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mcpClientService.callTool(serverId, toolName, args);
      return result;
    } catch (err) {
      setError(`Failed to call tool ${toolName} on MCP server ${serverId}`);
      console.error(`Error calling tool ${toolName} on MCP server ${serverId}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    servers,
    isLoading,
    error,
    refreshServers,
    addServer,
    updateServer,
    removeServer,
    toggleServerEnabled,
    getServerTools,
    testServerConnection,
    callTool,
  };

  return (
    <MCPContext.Provider value={value}>
      {children}
    </MCPContext.Provider>
  );
};

// Create a hook to use the MCP context
export const useMCP = () => {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error('useMCP must be used within an MCPProvider');
  }
  return context;
};