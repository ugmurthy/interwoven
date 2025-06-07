import React, { useState, useEffect } from 'react';
import { MCPServer } from '../../types';
import { Server, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { MCPClientService } from '../../services/mcp/MCPClientService';

interface MCPServerStatusProps {
  server: MCPServer;
  mcpClientService: MCPClientService;
  className?: string;
}

export function MCPServerStatus({
  server,
  mcpClientService,
  className = '',
}: MCPServerStatusProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'error' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check server status
  const checkStatus = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setStatus('checking');
    
    try {
      // This is a mock implementation
      // In a real implementation, this would check the MCP server status
      
      // Simulate a server check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration purposes, we'll use the server's enabled status
      if (server.enabled) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
      
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking MCP server status:', error);
      setStatus('error');
      setLastChecked(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Check status on mount and when server changes
  useEffect(() => {
    checkStatus();
    
    // Set up interval to check status periodically
    const interval = setInterval(checkStatus, 60000); // Check every minute
    
    return () => {
      clearInterval(interval);
    };
  }, [server.id, server.enabled]);
  
  // Get status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle size={16} className="text-green-500 dark:text-green-400" />;
      case 'offline':
        return <XCircle size={16} className="text-red-500 dark:text-red-400" />;
      case 'error':
        return <AlertTriangle size={16} className="text-yellow-500 dark:text-yellow-400" />;
      case 'checking':
        return <RefreshCw size={16} className="text-blue-500 dark:text-blue-400 animate-spin" />;
    }
  };
  
  // Get status text and color
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return <span className="text-green-600 dark:text-green-400">Online</span>;
      case 'offline':
        return <span className="text-red-600 dark:text-red-400">Offline</span>;
      case 'error':
        return <span className="text-yellow-600 dark:text-yellow-400">Error</span>;
      case 'checking':
        return <span className="text-blue-600 dark:text-blue-400">Checking...</span>;
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Server size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {server.name}
          </h3>
          <div className="ml-auto flex items-center">
            {getStatusIcon()}
            <span className="ml-1 text-sm">{getStatusText()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Server ID:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {server.id.substring(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Enabled:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {server.enabled ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {new Date(server.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {new Date(server.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Server Settings
          </h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(server.settings, null, 2)}
          </pre>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
          </span>
          <button
            onClick={checkStatus}
            disabled={isRefreshing}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <RefreshCw size={12} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}