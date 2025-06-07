import React, { useState, useEffect } from 'react';
import { Tool, MCPServer } from '../../types';
import { Server, Wrench, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface MCPToolSelectorProps {
  mcpServers: MCPServer[];
  availableTools: Tool[];
  selectedTools: Tool[];
  onToolSelect: (tool: Tool) => void;
  onToolDeselect: (toolId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MCPToolSelector({
  mcpServers,
  availableTools,
  selectedTools,
  onToolSelect,
  onToolDeselect,
  disabled = false,
  className = '',
}: MCPToolSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});
  
  // Filter MCP tools only
  const mcpTools = availableTools.filter(tool => tool.type === 'mcp' && tool.mcpServerId);
  
  // Group tools by MCP server
  const groupedTools: Record<string, Tool[]> = {};
  
  mcpTools.forEach(tool => {
    if (tool.mcpServerId) {
      if (!groupedTools[tool.mcpServerId]) {
        groupedTools[tool.mcpServerId] = [];
      }
      groupedTools[tool.mcpServerId].push(tool);
    }
  });
  
  // Initialize all servers as expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    mcpServers.forEach(server => {
      initialExpanded[server.id] = true;
    });
    setExpandedServers(initialExpanded);
  }, [mcpServers]);
  
  // Filter tools based on search query
  const filteredTools = searchQuery.trim() === ''
    ? mcpTools
    : mcpTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Group filtered tools
  const filteredGroupedTools: Record<string, Tool[]> = {};
  
  filteredTools.forEach(tool => {
    if (tool.mcpServerId) {
      if (!filteredGroupedTools[tool.mcpServerId]) {
        filteredGroupedTools[tool.mcpServerId] = [];
      }
      filteredGroupedTools[tool.mcpServerId].push(tool);
    }
  });
  
  // Toggle server expansion
  const toggleServer = (serverId: string) => {
    setExpandedServers({
      ...expandedServers,
      [serverId]: !expandedServers[serverId],
    });
  };
  
  // Check if a tool is selected
  const isToolSelected = (toolId: string) => {
    return selectedTools.some(tool => tool.id === toolId);
  };
  
  // Handle tool selection
  const handleToolSelect = (tool: Tool) => {
    if (disabled) return;
    
    if (isToolSelected(tool.id)) {
      onToolDeselect(tool.id);
    } else {
      onToolSelect(tool);
    }
  };
  
  // Get server name by ID
  const getServerName = (serverId: string) => {
    const server = mcpServers.find(s => s.id === serverId);
    return server ? server.name : serverId;
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          MCP Tools
        </h3>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MCP tools..."
            className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={disabled}
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
        </div>
      </div>
      
      <div className="p-4">
        {Object.keys(filteredGroupedTools).length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            {mcpServers.length === 0 
              ? 'No MCP servers configured. Add MCP servers to access tools.'
              : 'No MCP tools found'}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredGroupedTools).map(([serverId, tools]) => (
              <div key={serverId} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div
                  className="bg-gray-50 dark:bg-gray-750 p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleServer(serverId)}
                >
                  <div className="flex items-center">
                    <Server size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {getServerName(serverId)}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({tools.length})
                      </span>
                    </h4>
                  </div>
                  <div>
                    {expandedServers[serverId] ? (
                      <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedServers[serverId] && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => handleToolSelect(tool)}
                        className={`border rounded-md p-2 cursor-pointer transition-colors ${
                          isToolSelected(tool.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center">
                          <Wrench size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                          <div>
                            <h5 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {tool.name}
                            </h5>
                            {tool.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}