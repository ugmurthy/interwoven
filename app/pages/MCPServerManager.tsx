import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui/Layout';
import { Plus, Edit, Trash2, Server, Power } from 'lucide-react';
import { MCPServer } from '../types';
import { MCPClientService } from '../services/mcp/MCPClientService';
import { MCPServerManager as MCPServerManagerService } from '../services/mcp/MCPServerManager';
import { LocalStorageAdapter } from '../services/storage/LocalStorageAdapter';

export default function MCPServerManager() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    settings: {},
    enabled: true,
  });
  
  // Initialize MCP client service
  const mcpClientService: MCPClientService = new MCPServerManagerService(
    new LocalStorageAdapter()
  );
  
  // Load servers on component mount
  useEffect(() => {
    const loadServers = async () => {
      try {
        const serverList = await mcpClientService.getServers();
        setServers(serverList);
      } catch (error) {
        console.error('Failed to load MCP servers:', error);
      }
    };
    
    loadServers();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle settings changes (simplified for demo)
  const handleSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const settings = JSON.parse(e.target.value);
      setFormData({ ...formData, settings });
    } catch (error) {
      // Invalid JSON, but we'll let the user continue typing
      console.warn('Invalid JSON in settings field');
    }
  };
  
  // Add a new server
  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newServer = await mcpClientService.addServer({
        name: formData.name,
        settings: formData.settings,
        enabled: formData.enabled,
      });
      
      setServers([...servers, newServer]);
      setIsAddingServer(false);
      setFormData({ name: '', settings: {}, enabled: true });
    } catch (error) {
      console.error('Failed to add MCP server:', error);
    }
  };
  
  // Update an existing server
  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditingServer) return;
    
    try {
      const updatedServer = await mcpClientService.updateServer(isEditingServer, {
        name: formData.name,
        settings: formData.settings,
      });
      
      setServers(servers.map(server => 
        server.id === isEditingServer ? updatedServer : server
      ));
      
      setIsEditingServer(null);
      setFormData({ name: '', settings: {}, enabled: true });
    } catch (error) {
      console.error('Failed to update MCP server:', error);
    }
  };
  
  // Toggle server enabled status
  const handleToggleEnabled = async (id: string) => {
    try {
      const updatedServer = await mcpClientService.toggleServerEnabled(id);
      setServers(servers.map(server =>
        server.id === id ? updatedServer : server
      ));
    } catch (error) {
      console.error('Failed to toggle server enabled status:', error);
    }
  };
  
  // Delete a server
  const handleDeleteServer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this MCP server?')) {
      return;
    }
    
    try {
      await mcpClientService.removeServer(id);
      setServers(servers.filter(server => server.id !== id));
    } catch (error) {
      console.error('Failed to delete MCP server:', error);
    }
  };
  
  // Start editing a server
  const handleEditServer = (server: MCPServer) => {
    setIsEditingServer(server.id);
    setFormData({
      name: server.name,
      settings: server.settings,
      enabled: server.enabled,
    });
  };
  
  // Cancel adding/editing
  const handleCancel = () => {
    setIsAddingServer(false);
    setIsEditingServer(null);
    setFormData({ name: '', settings: {}, enabled: true });
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MCP Server Management
          </h1>
          
          {!isAddingServer && !isEditingServer && (
            <button
              onClick={() => setIsAddingServer(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" />
              Add MCP Server
            </button>
          )}
        </div>
        
        {/* Add/Edit Server Form */}
        {(isAddingServer || isEditingServer) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {isAddingServer ? 'Add MCP Server' : 'Edit MCP Server'}
            </h2>
            
            <form onSubmit={isAddingServer ? handleAddServer : handleUpdateServer}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="settings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Settings (JSON)
                </label>
                <textarea
                  id="settings"
                  name="settings"
                  value={JSON.stringify(formData.settings, null, 2)}
                  onChange={handleSettingsChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  {isAddingServer ? 'Add Server' : 'Update Server'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Server List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              MCP Servers
            </h2>
          </div>
          
          {servers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No MCP servers configured. Add a server to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {servers.map((server) => (
                <li key={server.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Server size={20} className="text-gray-500 dark:text-gray-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          {server.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {server.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleEnabled(server.id)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label={server.enabled ? "Disable server" : "Enable server"}
                      >
                        <Power
                          size={18}
                          className={`${server.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}
                        />
                      </button>
                      <button
                        onClick={() => handleEditServer(server)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Edit server"
                      >
                        <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Delete server"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}