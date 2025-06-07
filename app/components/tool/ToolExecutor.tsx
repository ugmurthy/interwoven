import React, { useState } from 'react';
import { Tool, ToolResponse } from '../../types';
import { Play, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';

interface ToolExecutorProps {
  tool: Tool;
  onExecute: (tool: Tool, args: Record<string, any>) => Promise<ToolResponse>;
  disabled?: boolean;
  className?: string;
}

export function ToolExecutor({
  tool,
  onExecute,
  disabled = false,
  className = '',
}: ToolExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<ToolResponse | null>(null);
  const [args, setArgs] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input change
  const handleInputChange = (key: string, value: any) => {
    if (disabled || isExecuting) return;
    
    setArgs({
      ...args,
      [key]: value,
    });
    
    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };
  
  // Validate arguments
  const validateArgs = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // This is a simple validation
    // In a real implementation, this would validate against a schema
    Object.entries(tool.configuration).forEach(([key, value]) => {
      if (args[key] === undefined || args[key] === null || args[key] === '') {
        newErrors[key] = 'This field is required';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Execute tool
  const handleExecute = async () => {
    if (disabled || isExecuting) return;
    
    if (validateArgs()) {
      setIsExecuting(true);
      setResponse(null);
      
      try {
        const result = await onExecute(tool, args);
        setResponse(result);
      } catch (error) {
        console.error('Error executing tool:', error);
        setResponse({
          toolId: tool.id,
          toolName: tool.name,
          mcpServerId: tool.mcpServerId,
          response: null,
          timestamp: new Date(),
          status: 'error',
        });
      } finally {
        setIsExecuting(false);
      }
    }
  };
  
  // Render input field based on value type
  const renderInputField = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${tool.id}-${key}`}
            checked={args[key] !== undefined ? args[key] : value}
            onChange={(e) => handleInputChange(key, e.target.checked)}
            disabled={disabled || isExecuting}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`${tool.id}-${key}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {args[key] !== undefined ? (args[key] ? 'Enabled' : 'Disabled') : (value ? 'Enabled' : 'Disabled')}
          </label>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <input
          type="number"
          id={`${tool.id}-${key}`}
          value={args[key] !== undefined ? args[key] : value}
          onChange={(e) => handleInputChange(key, Number(e.target.value))}
          disabled={disabled || isExecuting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            errors[key] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
      );
    } else if (Array.isArray(value)) {
      return (
        <select
          id={`${tool.id}-${key}`}
          value={args[key] !== undefined ? args[key] : value[0]}
          onChange={(e) => handleInputChange(key, e.target.value)}
          disabled={disabled || isExecuting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            errors[key] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          {value.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type="text"
          id={`${tool.id}-${key}`}
          value={args[key] !== undefined ? args[key] : value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          disabled={disabled || isExecuting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            errors[key] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
      );
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <span className="mr-2">{tool.name}</span>
          {tool.mcpServerId && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
              MCP: {tool.mcpServerId}
            </span>
          )}
        </h3>
        {tool.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {tool.description}
          </p>
        )}
      </div>
      
      <div className="p-4">
        <div className="space-y-4 mb-6">
          {Object.entries(tool.configuration).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={`${tool.id}-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              {renderInputField(key, value)}
              {errors[key] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleExecute}
            disabled={disabled || isExecuting}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
              (disabled || isExecuting) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Execute
              </>
            )}
          </button>
        </div>
        
        {/* Tool Response */}
        {response && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center mb-2">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mr-2">
                Response
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  response.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : response.status === 'error'
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {response.status === 'success' ? (
                  <CheckCircle size={12} className="inline mr-1" />
                ) : response.status === 'error' ? (
                  <AlertCircle size={12} className="inline mr-1" />
                ) : (
                  <Clock size={12} className="inline mr-1" />
                )}
                {response.status}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {new Date(response.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-3">
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(response.response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}