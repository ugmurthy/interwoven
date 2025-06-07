import React, { useState, useEffect } from 'react';
import { Layout } from '../components/ui/Layout';
import { SecretManager } from '../components/secret/SecretManager';
import { useMCP } from '../context/MCPContext';
import { MCPServer } from '../types';
import { Plus, Trash2, Edit, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Settings() {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Initialize on mount (client-side only)
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // During server-side rendering, render a simplified version
  if (!isBrowser) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h1>
          <p>Loading settings...</p>
        </div>
      </Layout>
    );
  }
  
  // Once we're in the browser, render the full component
  return <SettingsContent />;
}

// Separate component that uses hooks
function SettingsContent() {
  const { 
    servers, 
    isLoading, 
    error, 
    addServer, 
    updateServer, 
    removeServer, 
    toggleServerEnabled,
    testServerConnection
  } = useMCP();
  
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [serverName, setServerName] = useState('');
  const [serverSettings, setServerSettings] = useState('{}');
  const [testingServerId, setTestingServerId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  
  // Reset form
  const resetServerForm = () => {
    setServerName('');
    setServerSettings('{}');
  };
  
  // Handle add server
  const handleAddServer = async () => {
    if (!serverName) return;
    
    try {
      // Parse settings JSON
      const settings = JSON.parse(serverSettings);
      
      await addServer({
        name: serverName,
        settings,
        enabled: true,
      });
      
      resetServerForm();
      setIsAddingServer(false);
    } catch (error) {
      console.error('Error adding MCP server:', error);
      alert('Failed to add MCP server. Make sure the settings are valid JSON.');
    }
  };
  
  // Handle update server
  const handleUpdateServer = async () => {
    if (!editingServerId || !serverName) return;
    
    try {
      // Parse settings JSON
      const settings = JSON.parse(serverSettings);
      
      await updateServer(editingServerId, {
        name: serverName,
        settings,
      });
      
      resetServerForm();
      setEditingServerId(null);
    } catch (error) {
      console.error('Error updating MCP server:', error);
      alert('Failed to update MCP server. Make sure the settings are valid JSON.');
    }
  };
  
  // Handle remove server
  const handleRemoveServer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this MCP server?')) return;
    
    try {
      await removeServer(id);
      
      if (editingServerId === id) {
        resetServerForm();
        setEditingServerId(null);
      }
    } catch (error) {
      console.error('Error removing MCP server:', error);
      alert('Failed to remove MCP server');
    }
  };
  
  // Handle edit server
  const handleEditServer = (server: MCPServer) => {
    setServerName(server.name);
    setServerSettings(JSON.stringify(server.settings, null, 2));
    setEditingServerId(server.id);
  };
  
  // Handle toggle server enabled
  const handleToggleServerEnabled = async (id: string) => {
    try {
      await toggleServerEnabled(id);
    } catch (error) {
      console.error('Error toggling MCP server:', error);
      alert('Failed to toggle MCP server');
    }
  };
  
  // Handle test server connection
  const handleTestServerConnection = async (id: string) => {
    setTestingServerId(id);
    setTestResult(null);
    
    try {
      const result = await testServerConnection(id);
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
  
  // Tabs for different settings sections
  const [activeTab, setActiveTab] = useState<'secrets' | 'mcp'>('secrets');
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'secrets'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('secrets')}
          >
            Secrets & API Keys
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'mcp'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('mcp')}
          >
            MCP Servers
          </button>
        </div>
        
        {/* Secret Management */}
        {activeTab === 'secrets' && (
          <SecretManager />
        )}
        
        {/* MCP Server Management */}
        {activeTab === 'mcp' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  MCP Servers
                </h2>
                <button
                  onClick={() => {
                    resetServerForm();
                    setIsAddingServer(true);
                    setEditingServerId(null);
                  }}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  title="Add MCP server"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {/* Add/Edit Server Form */}
              {(isAddingServer || editingServerId) && (
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {editingServerId ? 'Edit MCP Server' : 'Add MCP Server'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="My MCP Server"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Settings (JSON)
                      </label>
                      <textarea
                        value={serverSettings}
                        onChange={(e) => setServerSettings(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                        placeholder='{"url": "http://localhost:3000", "apiKey": "your-api-key"}'
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          resetServerForm();
                          setIsAddingServer(false);
                          setEditingServerId(null);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={editingServerId ? handleUpdateServer : handleAddServer}
                        disabled={!serverName}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                          !serverName && 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {editingServerId ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Servers List */}
              {servers.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {servers.map((server) => (
                    <li key={server.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                              {server.name}
                            </h3>
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
                          
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            ID: {server.id}
                          </div>
                          
                          <div className="mt-2">
                            <button
                              onClick={() => handleTestServerConnection(server.id)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4"
                            >
                              Test Connection
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleServerEnabled(server.id)}
                            className={`p-1 ${
                              server.enabled
                                ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                            title={server.enabled ? 'Disable' : 'Enable'}
                          >
                            {server.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={() => handleEditServer(server)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveServer(server.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No MCP servers added yet. Click the + button to add a server.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}