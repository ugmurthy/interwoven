import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';
import { Wrench, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ToolInputProps {
  availableTools: Tool[];
  onToolsSelected: (tools: Tool[]) => void;
  initialTools?: Tool[];
  disabled?: boolean;
  className?: string;
}

export function ToolInput({
  availableTools,
  onToolsSelected,
  initialTools = [],
  disabled = false,
  className = '',
}: ToolInputProps) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>(initialTools);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);
  const [toolConfigs, setToolConfigs] = useState<Record<string, Record<string, any>>>({});

  // Initialize tool configurations
  useEffect(() => {
    const configs: Record<string, Record<string, any>> = {};
    initialTools.forEach(tool => {
      configs[tool.id] = { ...tool.configuration };
    });
    setToolConfigs(configs);
  }, [initialTools]);

  // Update parent component when selected tools change
  useEffect(() => {
    // Apply current configurations to the selected tools
    const toolsWithConfig = selectedTools.map(tool => ({
      ...tool,
      configuration: toolConfigs[tool.id] || {},
    }));
    
    onToolsSelected(toolsWithConfig);
  }, [selectedTools, toolConfigs, onToolsSelected]);

  const toggleTool = (tool: Tool) => {
    if (disabled) return;
    
    const isSelected = selectedTools.some(t => t.id === tool.id);
    
    if (isSelected) {
      // Remove tool
      setSelectedTools(selectedTools.filter(t => t.id !== tool.id));
    } else {
      // Add tool
      setSelectedTools([...selectedTools, tool]);
      
      // Initialize configuration if not already set
      if (!toolConfigs[tool.id]) {
        setToolConfigs({
          ...toolConfigs,
          [tool.id]: { ...tool.configuration },
        });
      }
    }
  };

  const updateToolConfig = (toolId: string, key: string, value: any) => {
    if (disabled) return;
    
    setToolConfigs({
      ...toolConfigs,
      [toolId]: {
        ...toolConfigs[toolId],
        [key]: value,
      },
    });
  };

  const removeTool = (toolId: string) => {
    if (disabled) return;
    
    setSelectedTools(selectedTools.filter(t => t.id !== toolId));
  };

  // Group tools by type
  const toolsByType: Record<string, Tool[]> = {};
  availableTools.forEach(tool => {
    const type = tool.type;
    if (!toolsByType[type]) {
      toolsByType[type] = [];
    }
    toolsByType[type].push(tool);
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Selected Tools */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Tools
          </h3>
          <button
            onClick={() => setIsToolPanelOpen(!isToolPanelOpen)}
            className="text-blue-600 dark:text-blue-400 text-sm flex items-center"
            disabled={disabled}
          >
            {isToolPanelOpen ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Hide Tools
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Browse Tools
              </>
            )}
          </button>
        </div>

        {selectedTools.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 text-center">
            No tools selected. Click "Browse Tools" to add tools.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedTools.map(tool => {
              const config = toolConfigs[tool.id] || {};
              
              return (
                <div
                  key={tool.id}
                  className="border border-gray-300 dark:border-gray-700 rounded-md p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center">
                        <Wrench size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          {tool.name}
                        </h4>
                      </div>
                      {tool.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tool.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeTool(tool.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                      disabled={disabled}
                      title="Remove tool"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Tool Configuration */}
                  <div className="mt-3 space-y-2">
                    {Object.entries(config).map(([key, value]) => (
                      <div key={`${tool.id}-${key}`} className="flex flex-col">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {key}
                        </label>
                        {typeof value === 'boolean' ? (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={e => updateToolConfig(tool.id, key, e.target.checked)}
                              disabled={disabled}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        ) : typeof value === 'number' ? (
                          <input
                            type="number"
                            value={value}
                            onChange={e => updateToolConfig(tool.id, key, Number(e.target.value))}
                            disabled={disabled}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : Array.isArray(value) ? (
                          <select
                            value={value[0]}
                            onChange={e => updateToolConfig(tool.id, key, e.target.value)}
                            disabled={disabled}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            {value.map((option, idx) => (
                              <option key={idx} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={e => updateToolConfig(tool.id, key, e.target.value)}
                            disabled={disabled}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tool Selection Panel */}
      {isToolPanelOpen && (
        <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 mb-4">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Available Tools
          </h3>

          {Object.entries(toolsByType).map(([type, tools]) => (
            <div key={type} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                {type} Tools
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tools.map(tool => {
                  const isSelected = selectedTools.some(t => t.id === tool.id);
                  
                  return (
                    <div
                      key={tool.id}
                      onClick={() => toggleTool(tool)}
                      className={`border rounded-md p-2 cursor-pointer transition-colors ${
                        isSelected
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}