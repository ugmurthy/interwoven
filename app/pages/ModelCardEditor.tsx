import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { ModelCard, ModelCapabilities, Parameter } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ModelCardConnector } from '../components/model-card/ModelCardConnector';
import { MCPServerConnector } from '../components/mcp/MCPServerConnector';
import { useModelCard } from '../context/ModelCardContext';
import { useLLM } from '../context/LLMContext';

export default function ModelCardEditor() {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Initialize on mount (client-side only)
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Force a re-render when isBrowser changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (isBrowser) {
      forceUpdate({});
    }
  }, [isBrowser]);
  
  const params = useParams();
  // Check if we're on the "new" route or editing an existing card
  const modelCardId = params.id === "model-card-new" ? null : params.id;
  const navigate = useNavigate();
  
  // Safe access to context hooks with conditional rendering
  const modelCardContext = isBrowser ? useModelCard() : null;
  const llmContext = isBrowser ? useLLM() : null;
  
  // Extract values from context if available
  const modelCards = modelCardContext?.modelCards || [];
  const getModelCard = modelCardContext?.getModelCard;
  const createModelCard = modelCardContext?.createModelCard;
  const updateModelCard = modelCardContext?.updateModelCard;
  const isServiceLoading = modelCardContext?.isLoading || false;
  
  // State for the model card being edited
  const [modelCard, setModelCard] = useState<ModelCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [llmProvider, setLlmProvider] = useState<'openrouter' | 'ollama'>('openrouter');
  const [llmModel, setLlmModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  // Get LLM context values
  const providers = llmContext?.providers || {
    openrouter: { availableModels: [], isAvailable: false, isLoading: false },
    ollama: { availableModels: [], isAvailable: false, isLoading: false }
  };
  const activeProvider = llmContext?.activeProvider || 'openrouter';
  const setActiveProvider = llmContext?.setActiveProvider || (() => {});
  const refreshLLMModels = llmContext?.refreshModels || (async () => {});
  
  // Update available models when provider changes
  useEffect(() => {
    setAvailableModels(providers[llmProvider].availableModels);
  }, [providers, llmProvider]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [capabilities, setCapabilities] = useState<ModelCapabilities>({
    supportsImages: false,
    supportsAudio: false,
    supportsFiles: false,
    supportsTools: false,
    supportedToolTypes: [],
  });
  
  // State for new parameter form
  const [newParamName, setNewParamName] = useState('');
  const [newParamType, setNewParamType] = useState<Parameter['type']>('string');
  const [newParamValue, setNewParamValue] = useState('');
  const [newParamDescription, setNewParamDescription] = useState('');
  const [newParamOptions, setNewParamOptions] = useState('');
  
  // State for connections
  const [connections, setConnections] = useState<{
    id: string;
    sourceId: string;
    targetId: string;
    type: 'model-to-model' | 'input-to-model' | 'model-to-output';
  }[]>([]);
  
  // Load model card data on mount
  useEffect(() => {
    if (!isBrowser || !getModelCard) return;
    
    const loadModelCard = async () => {
      setIsLoading(true);
      
      if (modelCardId) {
        try {
          const card = await getModelCard(modelCardId);
          
          if (card) {
            setModelCard(card);
            setName(card.name);
            setDescription(card.description);
            setSystemPrompt(card.systemPrompt);
            setLlmProvider(card.llmProvider);
            setLlmModel(card.llmModel);
            setParameters(card.parameters);
            setCapabilities(card.capabilities);
            setConnections([...card.inputConnections, ...card.outputConnections]);
          } else {
            // Model card not found, create a new one
            createNewModelCard();
          }
        } catch (error) {
          console.error('Error loading model card:', error);
          // If there's an error, create a new model card
          createNewModelCard();
        }
      } else {
        // No ID provided, create a new model card
        createNewModelCard();
      }
      
      setIsLoading(false);
    };
    
    loadModelCard();
  }, [isBrowser, modelCardId, getModelCard]);
  
  // Create a new model card
  const createNewModelCard = () => {
    const newCard: ModelCard = {
      id: uuidv4(),
      name: 'New Model Card',
      description: '',
      systemPrompt: '',
      parameters: [],
      inputConnections: [],
      outputConnections: [],
      llmProvider: 'openrouter',
      llmModel: '',
      capabilities: {
        supportsImages: false,
        supportsAudio: false,
        supportsFiles: false,
        supportsTools: false,
        supportedToolTypes: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setModelCard(newCard);
    setName(newCard.name);
    setDescription(newCard.description);
    setSystemPrompt(newCard.systemPrompt);
    setLlmProvider(newCard.llmProvider);
    setLlmModel(newCard.llmModel);
    setParameters(newCard.parameters);
    setCapabilities(newCard.capabilities);
    setConnections([]);
  };
  
  // Handle save model card
  const handleSaveModelCard = async () => {
    if (!isBrowser || !modelCard || !createModelCard || !updateModelCard) return;
    
    try {
      const updatedCardData = {
        name,
        description,
        systemPrompt,
        llmProvider,
        llmModel,
        parameters,
        capabilities,
        inputConnections: connections.filter(conn => conn.targetId === modelCard.id),
        outputConnections: connections.filter(conn => conn.sourceId === modelCard.id),
      };
      
      if (modelCardId) {
        // Update existing model card
        await updateModelCard(modelCardId, updatedCardData);
      } else {
        // Create new model card
        await createModelCard(updatedCardData as Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      // Navigate back to the model cards list
      navigate('/model-cards');
    } catch (error) {
      console.error('Error saving model card:', error);
      alert('Failed to save model card');
    }
  };
  
  // Handle add parameter
  const handleAddParameter = () => {
    if (!newParamName) return;
    
    const newParam: Parameter = {
      id: uuidv4(),
      name: newParamName,
      type: newParamType,
      value: newParamValue,
      description: newParamDescription || undefined,
    };
    
    if (newParamType === 'select' && newParamOptions) {
      newParam.options = newParamOptions.split(',').map(opt => opt.trim());
    }
    
    setParameters([...parameters, newParam]);
    
    // Reset form
    setNewParamName('');
    setNewParamType('string');
    setNewParamValue('');
    setNewParamDescription('');
    setNewParamOptions('');
  };
  
  // Handle remove parameter
  const handleRemoveParameter = (id: string) => {
    setParameters(parameters.filter(param => param.id !== id));
  };
  
  // Handle connect model cards
  const handleConnect = (sourceId: string, targetId: string, type: 'model-to-model' | 'input-to-model' | 'model-to-output') => {
    const newConnection = {
      id: uuidv4(),
      sourceId,
      targetId,
      type,
    };
    
    setConnections([...connections, newConnection]);
  };
  
  // Handle disconnect model cards
  const handleDisconnect = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };
  
  // Handle update model card
  const handleUpdateModelCard = (updates: Partial<ModelCard>) => {
    if (!modelCard) return;
    
    setModelCard({
      ...modelCard,
      ...updates,
    });
  };
  
  // Tabs for different sections
  const [activeTab, setActiveTab] = useState<'basic' | 'parameters' | 'capabilities' | 'connections' | 'mcp'>('basic');
  
  // During server-side rendering or while loading, show a simplified version
  if (!isBrowser || isLoading || isServiceLoading || !modelCard) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }
  
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
            {modelCardId ? 'Edit Model Card' : 'New Model Card'}
          </h1>
          
          <button
            onClick={handleSaveModelCard}
            className="ml-auto flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Save size={18} className="mr-2" />
            Save
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'basic'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'parameters'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('parameters')}
          >
            Parameters
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'capabilities'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('capabilities')}
          >
            Capabilities
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'connections'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('connections')}
          >
            Connections
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'mcp'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('mcp')}
          >
            MCP Integration
          </button>
        </div>
        
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Model Card Name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe what this model card does"
                />
              </div>
              
              <div>
                <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System Prompt
                </label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the system prompt for this model"
                />
              </div>
              
              <div>
                <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LLM Provider
                </label>
                <select
                  id="llmProvider"
                  value={llmProvider}
                  onChange={(e) => {
                    const newProvider = e.target.value as 'openrouter' | 'ollama';
                    setLlmProvider(newProvider);
                    setActiveProvider(newProvider);
                    // Clear model selection if no models available
                    if (providers[newProvider].availableModels.length === 0) {
                      setLlmModel('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="openrouter">
                    OpenRouter {!providers.openrouter.isAvailable && '(Not Available)'}
                  </option>
                  <option value="ollama">
                    Ollama {!providers.ollama.isAvailable && '(Not Available)'}
                  </option>
                </select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="llmModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LLM Model
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      refreshLLMModels().catch(error => {
                        console.error('Error refreshing models:', error);
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center"
                    title="Refresh Models"
                  >
                    <RefreshCw size={12} className={`mr-1 ${providers && providers[llmProvider] && providers[llmProvider].isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {providers && providers[llmProvider] && providers[llmProvider].availableModels && providers[llmProvider].availableModels.length > 0 ? (
                  <select
                    id="llmModel"
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a model</option>
                    {providers && providers[llmProvider] && providers[llmProvider].availableModels ?
                      providers[llmProvider].availableModels.map((model: string) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      )) : null
                    }
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="llmModel"
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={llmProvider === 'openrouter' ? 'anthropic/claude-3-opus' : 'llama3'}
                    />
                  </div>
                )}
                
                {providers && providers[llmProvider] && providers[llmProvider].isLoading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Loading available models...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Parameters
            </h2>
            
            {/* Add Parameter Form */}
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
                Add Parameter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="temperature"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newParamType}
                    onChange={(e) => setNewParamType(e.target.value as Parameter['type'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Value
                  </label>
                  <input
                    type="text"
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.7"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newParamDescription}
                    onChange={(e) => setNewParamDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Controls randomness"
                  />
                </div>
                
                {newParamType === 'select' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newParamOptions}
                      onChange={(e) => setNewParamOptions(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="option1, option2, option3"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddParameter}
                  disabled={!newParamName}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    !newParamName && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Add Parameter
                </button>
              </div>
            </div>
            
            {/* Parameters List */}
            {parameters.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {parameters.map((param) => (
                  <li key={param.id} className="py-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                          {param.name}
                        </h3>
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          {param.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {param.description || 'No description'}
                      </p>
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Default: </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{param.value}</span>
                      </div>
                      {param.options && (
                        <div className="mt-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options: </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {param.options.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveParameter(param.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No parameters added yet. Add parameters using the form above.
              </div>
            )}
          </div>
        )}
        
        {/* Capabilities Tab */}
        {activeTab === 'capabilities' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Model Capabilities
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="supportsImages"
                  checked={capabilities.supportsImages}
                  onChange={(e) => setCapabilities({ ...capabilities, supportsImages: e.target.checked })}
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
                  checked={capabilities.supportsAudio}
                  onChange={(e) => setCapabilities({ ...capabilities, supportsAudio: e.target.checked })}
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
                  checked={capabilities.supportsFiles}
                  onChange={(e) => setCapabilities({ ...capabilities, supportsFiles: e.target.checked })}
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
                  checked={capabilities.supportsTools}
                  onChange={(e) => setCapabilities({ ...capabilities, supportsTools: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="supportsTools" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Supports Tools
                </label>
              </div>
              
              {capabilities.supportsTools && (
                <div>
                  <label htmlFor="supportedToolTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supported Tool Types (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="supportedToolTypes"
                    value={capabilities.supportedToolTypes.join(', ')}
                    onChange={(e) => setCapabilities({
                      ...capabilities,
                      supportedToolTypes: e.target.value.split(',').map(type => type.trim()).filter(Boolean),
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="web-search, calculator, etc."
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ModelCardConnector
              sourceCard={modelCard}
              availableTargets={modelCards}
              existingConnections={connections}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
        )}
        
        {/* MCP Integration Tab */}
        {activeTab === 'mcp' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <MCPServerConnector
              modelCard={modelCard}
              onUpdateModelCard={handleUpdateModelCard}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}