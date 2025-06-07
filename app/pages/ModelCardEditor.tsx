import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ModelCard, ModelCapabilities } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

// Mock data for demonstration
const mockModelCard: ModelCard = {
  id: '1',
  name: 'Text Summarizer',
  description: 'Summarizes long text into concise paragraphs',
  systemPrompt: 'You are a helpful assistant that summarizes text.',
  parameters: [
    { id: '1', name: 'Length', type: 'number', value: 100 },
    { id: '2', name: 'Style', type: 'select', value: 'concise', options: ['concise', 'detailed', 'bullet-points'] },
  ],
  inputConnections: [],
  outputConnections: [],
  llmProvider: 'openrouter',
  llmModel: 'anthropic/claude-3-opus',
  capabilities: {
    supportsImages: true,
    supportsAudio: false,
    supportsFiles: true,
    supportsTools: true,
    supportedToolTypes: ['web-search', 'calculator'],
  },
  mcpServers: [],
  settings: {
    temperature: 0.7,
    maxTokens: 1000,
  },
  createdAt: new Date('2025-05-01'),
  updatedAt: new Date('2025-05-15'),
};

export default function ModelCardEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewModelCard = !id || id === 'new';
  
  const [formData, setFormData] = useState<Partial<ModelCard>>({
    name: '',
    description: '',
    systemPrompt: '',
    parameters: [],
    llmProvider: 'openrouter',
    llmModel: '',
    capabilities: {
      supportsImages: false,
      supportsAudio: false,
      supportsFiles: false,
      supportsTools: false,
      supportedToolTypes: [],
    } as ModelCapabilities, // Type assertion to ensure it matches the required interface
    mcpServers: [],
    settings: {},
  });
  
  // Load model card data if editing an existing one
  useEffect(() => {
    if (!isNewModelCard) {
      // In a real implementation, this would fetch from a service
      setFormData(mockModelCard);
    }
  }, [isNewModelCard]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle capability toggle
  const handleCapabilityToggle = (capability: keyof ModelCapabilities) => {
    if (capability === 'supportedToolTypes') return;
    
    const updatedCapabilities: ModelCapabilities = {
      supportsImages: formData.capabilities?.supportsImages || false,
      supportsAudio: formData.capabilities?.supportsAudio || false,
      supportsFiles: formData.capabilities?.supportsFiles || false,
      supportsTools: formData.capabilities?.supportsTools || false,
      supportedToolTypes: formData.capabilities?.supportedToolTypes || [],
    };
    
    updatedCapabilities[capability] = !updatedCapabilities[capability];
    
    setFormData({
      ...formData,
      capabilities: updatedCapabilities,
    });
  };
  
  // Handle settings changes
  const handleSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const settings = JSON.parse(e.target.value);
      setFormData({ ...formData, settings });
    } catch (error) {
      // Invalid JSON, but we'll let the user continue typing
      console.warn('Invalid JSON in settings field');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to a service
    console.log('Saving model card:', formData);
    
    // Navigate back to model cards list
    navigate('/model-cards');
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/model-cards')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNewModelCard ? 'Create Model Card' : 'Edit Model Card'}
          </h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Basic Information
              </h2>
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            {/* LLM Configuration */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                LLM Configuration
              </h2>
              
              <div className="mb-4">
                <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provider
                </label>
                <select
                  id="llmProvider"
                  name="llmProvider"
                  value={formData.llmProvider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="llmModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  id="llmModel"
                  name="llmModel"
                  value={formData.llmModel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            {/* Capabilities */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Capabilities
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supportsImages"
                    checked={formData.capabilities?.supportsImages || false}
                    onChange={() => handleCapabilityToggle('supportsImages')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="supportsImages" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Supports Images
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supportsAudio"
                    checked={formData.capabilities?.supportsAudio || false}
                    onChange={() => handleCapabilityToggle('supportsAudio')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="supportsAudio" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Supports Audio
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supportsFiles"
                    checked={formData.capabilities?.supportsFiles || false}
                    onChange={() => handleCapabilityToggle('supportsFiles')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="supportsFiles" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Supports Files
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="supportsTools"
                    checked={formData.capabilities?.supportsTools || false}
                    onChange={() => handleCapabilityToggle('supportsTools')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="supportsTools" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Supports Tools
                  </label>
                </div>
              </div>
            </div>
            
            {/* Settings */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Settings
              </h2>
              
              <div className="mb-4">
                <label htmlFor="settings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Settings (JSON)
                </label>
                <textarea
                  id="settings"
                  name="settings"
                  value={JSON.stringify(formData.settings || {}, null, 2)}
                  onChange={handleSettingsChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="{}"
                />
              </div>
            </div>
            
            {/* MCP Servers */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                MCP Servers
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Connected MCP Servers
                </label>
                {/* This would be a multi-select component in a real implementation */}
                <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 text-gray-500 dark:text-gray-400">
                  MCP Server selection would go here
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Save size={18} className="mr-2" />
                {isNewModelCard ? 'Create Model Card' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}