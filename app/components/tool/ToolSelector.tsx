import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';
import { Wrench, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface ToolSelectorProps {
  availableTools: Tool[];
  selectedTools: Tool[];
  onToolSelect: (tool: Tool) => void;
  onToolDeselect: (toolId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ToolSelector({
  availableTools,
  selectedTools,
  onToolSelect,
  onToolDeselect,
  disabled = false,
  className = '',
}: ToolSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Group tools by MCP server or type
  const groupedTools: Record<string, Tool[]> = {};
  
  availableTools.forEach(tool => {
    const groupKey = tool.mcpServerId || tool.type;
    if (!groupedTools[groupKey]) {
      groupedTools[groupKey] = [];
    }
    groupedTools[groupKey].push(tool);
  });
  
  // Initialize all categories as expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(groupedTools).forEach(key => {
      initialExpanded[key] = true;
    });
    setExpandedCategories(initialExpanded);
  }, []);
  
  // Filter tools based on search query
  const filteredTools = searchQuery.trim() === ''
    ? availableTools
    : availableTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Group filtered tools
  const filteredGroupedTools: Record<string, Tool[]> = {};
  
  filteredTools.forEach(tool => {
    const groupKey = tool.mcpServerId || tool.type;
    if (!filteredGroupedTools[groupKey]) {
      filteredGroupedTools[groupKey] = [];
    }
    filteredGroupedTools[groupKey].push(tool);
  });
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
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
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Available Tools
        </h3>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
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
            No tools found
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredGroupedTools).map(([category, tools]) => (
              <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div
                  className="bg-gray-50 dark:bg-gray-750 p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">
                    {category === 'mcp' ? 'MCP Tools' : category}
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({tools.length})
                    </span>
                  </h4>
                  <div>
                    {expandedCategories[category] ? (
                      <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedCategories[category] && (
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