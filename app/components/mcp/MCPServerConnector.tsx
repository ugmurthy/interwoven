import React, { useState, useEffect } from 'react';
import { useMCP } from '../../context/MCPContext';
import { useMCPServer } from '../../hooks/useMCPServer';
import { ModelCard } from '../../types';
import { Plus, Trash2, RefreshCw, Check, X } from 'lucide-react';

interface MCPServerConnectorProps {
  modelCard: ModelCard;
  onUpdateModelCard: (updates: Partial<ModelCard>) => void;
}

export function MCPServerConnector({ modelCard, onUpdateModelCard }: MCPServerConnectorProps) {
  const { servers, testServerConnection } = useMCP();
  const { 
    connectedServers, 
    availableTools, 
    isLoading, 
    error,
    connectServer, 
    disconnectServer,
    getConnectedServerDetails
  } = useMCPServer(modelCard);
  
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [testingServerId, setTestingServerId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  
  // Update model card when connected servers change
  useEffect(() => {
    onUpdateModelCard({ mcpServers: connectedServers });
  }, [connectedServers, onUpdateModelCard]);
  
  // Handle connect server
  const handleConnectServer = async () => {
    if (!selectedServer) return;
    
    try {
      await connectServer(selectedServer);
      setSelectedServer('');
    } catch (error) {
      console.error('Error connecting MCP server:', error);
      alert('Failed to connect MCP server');
    }
  };
  
  // Handle disconnect server
  const handleDisconnectServer = (serverId: string) => {
    try {
      disconnectServer(serverId);
    } catch (error) {
      console.error('Error disconnecting MCP server:', error);
      alert('Failed to disconnect MCP server');
    }
  };
  
  // Handle test server connection
  const handleTestServerConnection = async (serverId: string) => {
    setTestingServerId(serverId);
    setTestResult(null);
    
    try {
      const result = await testServerConnection(serverId);
      setTestResult(result);
    } catch (error) {
      console.error('Error testing MCP server connection:', error);
      setTestResult(false);
    } finally {
      // Clear test result after 3 seconds
      setTimeout(() => {
        setTestingServerId(null);
        setTestResult(null);
      }, 3000);
    }
  };
  
  // Get available servers that are not already connected
  const availableServers = servers.filter(
    server => !connectedServers.includes(server.id) && server.enabled
  );
  
  // Get connected server details
  const connectedServerDetails = getConnectedServerDetails();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        MCP Server Integration
      </h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Connect Server Form */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Connect MCP Server
        </label>
        <div className="flex space-x-2">
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading || availableServers.length === 0}
          >
            <option value="">Select a server</option>
            {availableServers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleConnectServer}
            disabled={!selectedServer || isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
              (!selectedServer || isLoading) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
        
        {availableServers.length === 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No available MCP servers to connect. Add servers in the Settings page.
          </p>
        )}
      </div>
      
      {/* Connected Servers */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Connected Servers
        </h4>
        
        {connectedServerDetails.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {connectedServerDetails.map((server) => (
              <li key={server.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {server.name}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                    server.enabled 
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  }`}>
                    {server.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  
                  {testingServerId === server.id && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                      testResult === null
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : testResult
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {testResult === null ? 'Testing...' : testResult ? 'Connected' : 'Failed'}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestServerConnection(server.id)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Test Connection"
                    disabled={testingServerId !== null}
                  >
                    <RefreshCw size={16} className={testingServerId === server.id ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => handleDisconnectServer(server.id)}
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Disconnect"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No MCP servers connected to this model card.
          </div>
        )}
      </div>
      
      {/* Available Tools */}
      {availableTools.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Available Tools
          </h4>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableTools.map((tool) => (
              <li key={tool.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                <div className="font-medium text-gray-800 dark:text-gray-200">{tool.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}