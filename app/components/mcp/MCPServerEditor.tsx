import React, { useState, useEffect } from 'react';
import { MCPServer } from '../../types';
import { Save, X } from 'lucide-react';

interface MCPServerEditorProps {
  server?: MCPServer;
  onSave: (server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  disabled?: boolean;
  className?: string;
}

export function MCPServerEditor({
  server,
  onSave,
  onCancel,
  disabled = false,
  className = '',
}: MCPServerEditorProps) {
  const [formData, setFormData] = useState<{
    name: string;
    settings: string;
    enabled: boolean;
  }>({
    name: '',
    settings: '{}',
    enabled: true,
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    settings?: string;
  }>({});
  
  // Initialize form data when server changes
  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name,
        settings: JSON.stringify(server.settings, null, 2),
        enabled: server.enabled,
      });
    } else {
      setFormData({
        name: '',
        settings: '{}',
        enabled: true,
      });
    }
  }, [server]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      settings?: string;
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }
    
    try {
      JSON.parse(formData.settings);
    } catch (error) {
      newErrors.settings = 'Invalid JSON format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name,
        settings: JSON.parse(formData.settings),
        enabled: formData.enabled,
      });
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {server ? 'Edit MCP Server' : 'Add MCP Server'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          disabled={disabled}
        >
          <X size={18} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Server Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Server Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>
          
          {/* Server Settings */}
          <div>
            <label htmlFor="settings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Server Settings (JSON)
            </label>
            <textarea
              id="settings"
              name="settings"
              value={formData.settings}
              onChange={handleInputChange}
              rows={8}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm ${
                errors.settings ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.settings && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.settings}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter server settings in JSON format. These settings will be used to configure the MCP server connection.
            </p>
          </div>
          
          {/* Server Enabled */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={formData.enabled}
              onChange={handleCheckboxChange}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable Server
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Save size={16} className="mr-2" />
            {server ? 'Update Server' : 'Add Server'}
          </button>
        </div>
      </form>
    </div>
  );
}