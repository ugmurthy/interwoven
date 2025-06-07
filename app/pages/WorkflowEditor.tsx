import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ArrowLeft, Save, Plus, Trash2, Play } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { useModelCard } from '../context/ModelCardContext';
import { ModelCard } from '../types';

export default function WorkflowEditor() {
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
            Workflow Editor
          </h1>
          <p>Loading workflow editor...</p>
        </div>
      </Layout>
    );
  }
  
  // Once we're in the browser, render the full component
  return <WorkflowEditorContent />;
}

// Separate component that uses hooks
function WorkflowEditorContent() {
  // Get the ID from the URL path parameter
  const params = useParams();
  const workflowId = params.id;
  const navigate = useNavigate();
  
  // Check if we're on the new workflow route
  const isNew = workflowId === 'new';
  
  const {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    createWorkflow,
    updateWorkflow,
    saveWorkflow,
    executeWorkflow,
    addModelCard,
    removeModelCard,
    createConnection,
    removeConnection,
    loadWorkflow
  } = useWorkflow();
  
  // Use the ModelCardContext to get model cards
  const { modelCards: availableModelCardsFromContext, isLoading: isLoadingModelCards } = useModelCard();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [availableModelCards, setAvailableModelCards] = useState<ModelCard[]>([]);
  const [selectedModelCard, setSelectedModelCard] = useState<string>('');
  const [canvasModelCards, setCanvasModelCards] = useState<ModelCard[]>([]);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // No need for mock data anymore, we're using the ModelCardContext
  
  // Load workflow data on mount
  useEffect(() => {
    async function initializeWorkflow() {
      try {
        setIsLoading(true);
        console.log(`Initializing workflow editor with ID: ${workflowId}, isNew: ${isNew}`);
        
        // Set available model cards from context
        setAvailableModelCards(availableModelCardsFromContext);
        
        // If workflowId is provided and not on the "new" route, load the workflow
        if (workflowId && !isNew) {
          console.log(`Loading existing workflow with ID: ${workflowId}`);
          
          // First try to find the workflow in the current state
          let workflow = workflows.find(w => w.id === workflowId);
          
          // If not found, try to load it
          if (!workflow) {
            console.log(`Workflow not in state, loading from storage: ${workflowId}`);
            const loadedWorkflow = await loadWorkflow(workflowId);
            if (loadedWorkflow) {
              workflow = loadedWorkflow;
            }
          }
          
          if (workflow) {
            console.log(`Found workflow: ${workflow.name}`);
            setCurrentWorkflow(workflow);
            setName(workflow.name || '');
            setDescription(workflow.description || '');
            setCanvasModelCards(workflow.modelCards || []);
          } else {
            console.log(`Workflow not found, redirecting to workflows list`);
            // Workflow not found, redirect to workflows list
            navigate('/workflows');
            return;
          }
        } else if (isNew) {
          // On the "new" route, just initialize the form without creating a workflow yet
          console.log('Initializing new workflow form');
          setCurrentWorkflow(null);
          setName('');
          setDescription('');
          setCanvasModelCards([]);
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error in workflow initialization:', err);
        setError(`Error initializing workflow: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeWorkflow();
  }, [workflowId, isNew, availableModelCardsFromContext, loadWorkflow, workflows, navigate]); // Include all dependencies
  
  // Update workflow when name or description changes, but debounce it
  useEffect(() => {
    if (!isInitialized || !currentWorkflow) return;
    
    const timer = setTimeout(() => {
      try {
        if (name !== currentWorkflow.name || description !== currentWorkflow.description) {
          console.log(`Updating workflow: ${currentWorkflow.id}`);
          updateWorkflow(currentWorkflow.id, { name, description });
        }
      } catch (err) {
        console.error('Error updating workflow:', err);
        setError(`Error updating workflow: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timer);
  }, [name, description, currentWorkflow, isInitialized]);
  
  // Handle save workflow
  const handleSaveWorkflow = async () => {
    try {
      if (isNew) {
        // Create a new workflow when saving for the first time
        console.log('Creating new workflow on save');
        const newWorkflow = createWorkflow(name || 'New Workflow', description);
        
        // Add any model cards that were added to the canvas
        if (canvasModelCards.length > 0) {
          canvasModelCards.forEach(card => {
            addModelCard(card);
          });
        }
        
        // Redirect to the workflows list
        navigate('/workflows', { replace: true });
      } else if (currentWorkflow) {
        // Update existing workflow
        console.log(`Saving workflow: ${currentWorkflow.id}`);
        await saveWorkflow();
        
        // Redirect to the workflows list
        navigate('/workflows', { replace: true });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      setError(`Error saving workflow: ${error instanceof Error ? error.message : String(error)}`);
      alert('Failed to save workflow');
    }
  };
  
  // Handle execute workflow
  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;
    
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      console.log(`Executing workflow: ${currentWorkflow.id}`);
      const result = await executeWorkflow('Sample input for workflow execution');
      setExecutionResult(result);
    } catch (error) {
      console.error('Error executing workflow:', error);
      setError(`Error executing workflow: ${error instanceof Error ? error.message : String(error)}`);
      alert('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Handle add model card to canvas
  const handleAddModelCard = () => {
    if (!selectedModelCard) return;
    
    try {
      const modelCard = availableModelCards.find(card => card.id === selectedModelCard);
      if (modelCard) {
        console.log(`Adding model card: ${modelCard.id}`);
        // Clone the model card to avoid reference issues
        const clonedCard: ModelCard = {
          ...modelCard,
          id: `${modelCard.id}-${Date.now()}`, // Generate a new ID
          inputConnections: [],
          outputConnections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // If we have a current workflow, add it there
        if (currentWorkflow) {
          addModelCard(clonedCard);
        }
        
        // Always update the local state
        setCanvasModelCards(prev => [...prev, clonedCard]);
        setSelectedModelCard('');
      }
    } catch (error) {
      console.error('Error adding model card:', error);
      setError(`Error adding model card: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle remove model card from canvas
  const handleRemoveModelCard = (cardId: string) => {
    try {
      console.log(`Removing model card: ${cardId}`);
      
      // If we have a current workflow, remove it there
      if (currentWorkflow) {
        removeModelCard(cardId);
      }
      
      // Always update the local state
      setCanvasModelCards(prev => prev.filter(card => card.id !== cardId));
      
      // If this card was selected as a connection source, clear it
      if (connectionSource === cardId) {
        setConnectionSource(null);
      }
    } catch (error) {
      console.error('Error removing model card:', error);
      setError(`Error removing model card: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle start connection
  const handleStartConnection = (cardId: string) => {
    try {
      console.log(`Starting connection from: ${cardId}`);
      setConnectionSource(cardId);
    } catch (error) {
      console.error('Error starting connection:', error);
      setError(`Error starting connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle complete connection
  const handleCompleteConnection = (targetId: string) => {
    if (!connectionSource) return;
    
    try {
      // Don't connect to self
      if (connectionSource === targetId) {
        setConnectionSource(null);
        return;
      }
      
      console.log(`Creating connection: ${connectionSource} -> ${targetId}`);
      
      // If we have a current workflow, create the connection there
      if (currentWorkflow) {
        createConnection(connectionSource, targetId, 'model-to-model');
      }
      
      // Reset connection source
      setConnectionSource(null);
    } catch (error) {
      console.error('Error completing connection:', error);
      setError(`Error completing connection: ${error instanceof Error ? error.message : String(error)}`);
      setConnectionSource(null);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isNew ? 'Create Workflow' : 'Edit Workflow'}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">Loading workflow...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/workflows')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNew ? 'Create Workflow' : 'Edit Workflow'}
          </h1>
          
          <div className="ml-auto flex space-x-2">
            <button
              onClick={handleSaveWorkflow}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Save size={18} className="mr-2" />
              Save Workflow
            </button>
            
            {!isNew && (
              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || !currentWorkflow}
                className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 ${
                  (isExecuting || !currentWorkflow) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Play size={18} className="mr-2" />
                {isExecuting ? 'Executing...' : 'Execute Workflow'}
              </button>
            )}
          </div>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Workflow Details
            </h2>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Workflow"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your workflow"
            />
          </div>
        </div>
        
        {/* Workflow Canvas */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 mb-6 min-h-[400px]">
          {canvasModelCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                Workflow Editor Canvas
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                Add model cards to create a workflow
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {canvasModelCards.map((card) => (
                <div 
                  key={card.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 ${
                    connectionSource === card.id 
                      ? 'border-blue-500' 
                      : connectionSource 
                        ? 'border-dashed border-blue-300 cursor-pointer' 
                        : 'border-transparent'
                  }`}
                  onClick={() => connectionSource && connectionSource !== card.id && handleCompleteConnection(card.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{card.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnection(card.id);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Connect from this card"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModelCard(card.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove card"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                  
                  {/* Display model capabilities */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.capabilities.supportsImages && (
                      <span className="px-1 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        Images
                      </span>
                    )}
                    {card.capabilities.supportsTools && (
                      <span className="px-1 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        Tools
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Model Cards Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Available Model Cards
          </h2>
          
          <div className="mb-4">
            <label htmlFor="modelCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select a Model Card
            </label>
            <div className="flex space-x-2">
              <select
                id="modelCard"
                value={selectedModelCard}
                onChange={(e) => setSelectedModelCard(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a model card</option>
                {availableModelCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAddModelCard}
                disabled={!selectedModelCard}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                  !selectedModelCard ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Add to Canvas
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModelCards.map((card) => (
              <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{card.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {card.llmProvider}
                  </span>
                  <span className="px-1 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                    {card.llmModel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Execution Result */}
        {executionResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Execution Result
            </h2>
            
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}