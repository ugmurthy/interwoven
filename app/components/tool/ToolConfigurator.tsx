import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';
import { Wrench, Save, X } from 'lucide-react';

interface ToolConfiguratorProps {
  tool: Tool;
  onConfigChange: (toolId: string, config: Record<string, any>) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ToolConfigurator({
  tool,
  onConfigChange,
  onClose,
  disabled = false,
  className = '',
}: ToolConfiguratorProps) {
  const [config, setConfig] = useState<Record<string, any>>(tool.configuration || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update config when tool changes
  useEffect(() => {
    setConfig(tool.configuration || {});
  }, [tool]);
  
  // Handle input change
  const handleInputChange = (key: string, value: any) => {
    if (disabled) return;
    
    setConfig({
      ...config,
      [key]: value,
    });
    
    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };
  
  // Validate configuration
  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // This is a simple validation
    // In a real implementation, this would validate against a schema
    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        newErrors[key] = 'This field is required';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Save configuration
  const handleSave = () => {
    if (disabled) return;
    
    if (validateConfig()) {
      onConfigChange(tool.id, config);
      if (onClose) {
        onClose();
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
            checked={value}
            onChange={(e) => handleInputChange(key, e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`${tool.id}-${key}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {value ? 'Enabled' : 'Disabled'}
          </label>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <input
          type="number"
          id={`${tool.id}-${key}`}
          value={value}
          onChange={(e) => handleInputChange(key, Number(e.target.value))}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            errors[key] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
      );
    } else if (Array.isArray(value)) {
      return (
        <select
          id={`${tool.id}-${key}`}
          value={config[key]}
          onChange={(e) => handleInputChange(key, e.target.value)}
          disabled={disabled}
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
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            errors[key] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
          }`}
        />
      );
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <Wrench size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Configure {tool.name}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={disabled}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        {tool.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {tool.description}
          </p>
        )}
        
        <div className="space-y-4">
          {Object.entries(config).map(([key, value]) => (
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
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={disabled}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
              disabled && 'opacity-50 cursor-not-allowed'
            }`}
          >
            <Save size={16} className="mr-2" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}