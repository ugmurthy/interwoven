import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { PlusCircle, Workflow, Server, Settings, Send, Link as LinkIcon, RefreshCw, MessageSquare, Mic, FileText } from 'lucide-react';
import { TextInput } from '../components/input/TextInput';
import { AudioInput } from '../components/input/AudioInput';
import { FileInput } from '../components/input/FileInput';
import { OutputRenderer } from '../components/output/OutputRenderer';
import { WorkflowInputWrapper } from '../components/workflow/WorkflowInputWrapper';
import { WorkflowOutputRenderer } from '../components/workflow/WorkflowOutputRenderer';
import { useLLM } from '../context/LLMContext';
import { useModelCard } from '../context/ModelCardContext';
import { useWorkflow } from '../context/WorkflowContext';
import { LLMRequest, Output, UsageStatistics, WorkflowExecutionResult } from '../types';

// Define the FileWithContent interface to match what's in FileInput.tsx
interface FileWithContent {
  file: File;
  content?: string;
  error?: string;
}

export default function Home() {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Use effect to set isBrowser to true after mount
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Safe access to context hooks with conditional rendering
  const llmContext = isBrowser ? useLLM() : null;
  const modelCardContext = isBrowser ? useModelCard() : null;
  const workflowContext = isBrowser ? useWorkflow() : null;
  
  // Get LLM service and model cards if in browser
  const sendRequest = llmContext?.sendRequest;
  const activeProvider = llmContext?.activeProvider || 'openrouter';
  const providers = llmContext?.providers || { openrouter: { availableModels: [] }, ollama: { availableModels: [] } };
  const modelCards = modelCardContext?.modelCards || [];
  const isLoadingModelCards = modelCardContext?.isLoading || false;
  const workflows = workflowContext?.workflows || [];
  
  // State for input, output, and selection
  const [inputType, setInputType] = useState<'text' | 'audio' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileWithContent[]>([]);
  const [output, setOutput] = useState<Output | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'workflow' | 'modelCard' | null>('modelCard'); // Default to modelCard
  const [selectedModelCardId, setSelectedModelCardId] = useState<string>('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reference to the text input element for focusing
  const textInputRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Force a re-render when isBrowser changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (isBrowser) {
      forceUpdate({});
    }
  }, [isBrowser]);
  
  // Reset session function
  const resetSession = () => {
    setTextInput('');
    setAudioBlob(null);
    setAudioUrl(null);
    setSelectedFiles([]); // This still works with the new type
    setOutput(null);
    setIsProcessing(false);
    
    // Focus the text input if it's the current input type
    if (inputType === 'text' && textInputRef.current) {
      textInputRef.current.focus();
    }
  };
  
  // Set initial model card and workflow when they become available
  useEffect(() => {
    if (modelCards.length > 0 && selectedTarget === 'modelCard') {
      setSelectedModelCardId(modelCards[0].id);
    }
  }, [modelCards, selectedTarget]);
  
  useEffect(() => {
    if (workflows.length > 0 && selectedTarget === 'workflow') {
      setSelectedWorkflowId(workflows[0].id);
    }
  }, [workflows, selectedTarget]);
  
  // Reset selection when target changes (treat as new session)
  useEffect(() => {
    if (selectedTarget === 'modelCard') {
      setSelectedWorkflowId('');
      // Always set a default model card if available
      if (modelCards.length > 0) {
        console.log("Setting model card on target change:", modelCards[0].id);
        setSelectedModelCardId(modelCards[0].id);
      }
      // Reset session when switching to Model Card
      resetSession();
    } else if (selectedTarget === 'workflow') {
      setSelectedModelCardId('');
      // Set a default workflow if available
      if (workflows.length > 0) {
        console.log("Setting workflow on target change:", workflows[0].id);
        setSelectedWorkflowId(workflows[0].id);
      }
      // Reset session when switching to Workflow
      resetSession();
    }
  }, [selectedTarget, modelCards, workflows]);
  
  // Handle input submission
  const handleSubmit = async () => {
    if (!selectedTarget || !isBrowser || !sendRequest) {
      return;
    }
    
    // Validate input based on type
    if (inputType === 'text' && !textInput.trim()) {
      return;
    }
    if (inputType === 'audio' && !audioBlob) {
      return;
    }
    if (inputType === 'file' && selectedFiles.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    setOutput(null); // Clear previous output
    
    try {
      if (selectedTarget === 'modelCard' && selectedModelCardId) {
        // Find the selected model card
        const modelCard = modelCards.find(card => card.id === selectedModelCardId);
        
        if (!modelCard) {
          throw new Error('Selected model card not found');
        }
        
        // Check if model supports the selected input type
        if (inputType === 'audio' && !modelCard.capabilities.supportsAudio) {
          throw new Error('Selected model does not support audio input');
        }
        
        if (inputType === 'file' && !modelCard.capabilities.supportsFiles) {
          throw new Error('Selected model does not support file input');
        }
        
        // Prepare input based on type
        let userInput = '';
        
        if (inputType === 'text') {
          // Check if text input contains URLs and process them
          if (textInput.match(/(https?:\/\/[^\s]+)/g)) {
            try {
              // Show loading state for URL processing
              setOutput({
                id: `processing-${Date.now()}`,
                type: 'text',
                content: 'Processing URLs in your input...',
                usageStatistics: {
                  promptTokens: 0,
                  completionTokens: 0,
                  totalTokens: 0,
                  executionTime: 0,
                  toolCalls: 0,
                },
                metadata: {},
              });
              
              // Import and use the URL content extractor
              const { extractUrlContent } = await import('../utils/urlContentExtractor');
              userInput = await extractUrlContent(textInput);
              console.log('Processed input with URL content extraction');
            } catch (error) {
              console.error('Error processing URLs:', error);
              userInput = textInput + '\n\n[Error processing URLs: ' +
                (error instanceof Error ? error.message : String(error)) + ']';
            }
          } else {
            userInput = textInput;
          }
        } else if (inputType === 'audio') {
          userInput = 'Audio input: Please transcribe and respond to this audio.';
        } else if (inputType === 'file') {
          // Create a more detailed prompt that includes file content
          const fileNames = selectedFiles.map(f => f.file.name).join(', ');
          const fileContents = selectedFiles
            .filter(f => f.content) // Only include files with extracted content
            .map(f => `--- ${f.file.name} ---\n${f.content}`)
            .join('\n\n');
          
          userInput = `File input: ${fileNames}. Please analyze these files.\n\n${fileContents}`;
          
          console.log('File content included in prompt:', fileContents.length > 0);
        }
        
        // Create LLM request
        // Combine system prompt and user input with a double newline separator
        // This format is expected by the LLM adapters to extract the system prompt
        const combinedPrompt = modelCard.systemPrompt + '\n\n' + userInput;
        
        console.log('Home handleSubmit - System prompt:', modelCard.systemPrompt);
        console.log('Home handleSubmit - User input:', userInput);
        console.log('Home handleSubmit - Input type:', inputType);
        
        const request: LLMRequest = {
          provider: modelCard.llmProvider,
          model: modelCard.llmModel,
          prompt: combinedPrompt,
          parameters: {},
          files: inputType === 'file' ? selectedFiles.map(f => f.file) : undefined,
        };
        
        // Add parameters from model card with proper type conversion
        modelCard.parameters.forEach(param => {
          // Convert parameter values to the appropriate types
          if (param.type === 'number') {
            request.parameters[param.name] = Number(param.value);
          } else if (param.type === 'boolean') {
            request.parameters[param.name] = Boolean(param.value);
          } else if (param.type === 'select' || param.type === 'string') {
            request.parameters[param.name] = String(param.value);
          } else {
            // Default case
            request.parameters[param.name] = param.value;
          }
        });
        
        console.log('Home handleSubmit - Request:', {
          provider: request.provider,
          model: request.model,
          parameters: request.parameters
        });
        
        // Send request to LLM service
        const startTime = Date.now();
        const response = await sendRequest(request);
        const endTime = Date.now();
        
        // Create output
        const usageStatistics: UsageStatistics = {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          executionTime: endTime - startTime,
          toolCalls: response.toolResults?.length || 0,
        };
        
        setOutput({
          id: response.id,
          type: 'markdown',
          content: response.content,
          toolResponses: response.toolResults?.map(tool => ({
            toolId: tool.toolId,
            toolName: tool.toolId,
            response: tool.result,
            mcpServerId: tool.mcpServerId,
            timestamp: new Date(),
            status: tool.error ? 'error' : 'success',
          })),
          usageStatistics,
          metadata: response.metadata,
        });
      } else if (selectedTarget === 'workflow' && selectedWorkflowId) {
        // Workflow execution is now handled by the WorkflowInputWrapper component
        // This code path should not be reached anymore
        console.warn('Workflow execution should be handled by WorkflowInputWrapper');
      }
    } catch (error) {
      console.error('Error processing input:', error);
      
      // Create error output
      setOutput({
        id: `error-${Date.now()}`,
        type: 'text',
        content: `Error processing input: ${error instanceof Error ? error.message : String(error)}`,
        usageStatistics: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          executionTime: 0,
          toolCalls: 0,
        },
        metadata: {},
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Quick action cards
  const quickActions = [
    {
      title: 'Create Model Card',
      description: 'Create a new model card with custom parameters',
      icon: <PlusCircle size={24} className="text-blue-600 dark:text-blue-400" />,
      link: '/model-cards/new',
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Manage Workflows',
      description: 'Create and manage model card workflows',
      icon: <Workflow size={24} className="text-purple-600 dark:text-purple-400" />,
      link: '/workflows',
      color: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'MCP Servers',
      description: 'Coming soon',
      icon: <Server size={24} className="text-green-600 dark:text-green-400" />,
      link: '/',
      color: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      icon: <Settings size={24} className="text-gray-600 dark:text-gray-400" />,
      link: '/settings',
      color: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Model Card Application
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create, connect, and manage model cards to build powerful AI workflows
          </p>
        </div>

        {/* Loading State for Server-Side Rendering */}
        {!isBrowser ? (
          <div className="mb-12 grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Loading...
              </h2>
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Initializing application...
              </div>
            </div>
          </div>
        ) : (
          /* Input/Output Section - Only render on client side */
          <div className="mb-12 grid grid-cols-1 gap-6">
            {/* Input Component */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex space-x-4 mb-4">
                
                  <button
                    type="button"
                    onClick={() => setSelectedTarget('modelCard')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      selectedTarget === 'modelCard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Model Card
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedTarget('workflow')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      selectedTarget === 'workflow'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Workflow size={18} className="mr-2" />
                    Workflow
                  </button>
                </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Input
              </h2>
              
              {/* Input Type Selector */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setInputType('text')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      inputType === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <MessageSquare size={16} className="mr-1" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('audio')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      inputType === 'audio'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Mic size={16} className="mr-1" />
                    Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('file')}
                    className={`px-3 py-1.5 rounded-md flex items-center ${
                      inputType === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FileText size={16} className="mr-1" />
                    File
                  </button>
                </div>
                
                {/* Text Input - Common for both Model Card and Workflow */}
                {inputType === 'text' && (
                  <div>
                    <TextInput
                      initialValue={textInput}
                      onChange={(value) => {
                        console.log("TextInput onChange called with:", value);
                        setTextInput(value);
                      }}
                      placeholder={selectedTarget === 'modelCard'
                        ? "Enter your text input for the model card..."
                        : "Enter your text input for the workflow..."}
                      rows={4}
                      ref={textInputRef}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Current input: {textInput ? `"${textInput.substring(0, 30)}${textInput.length > 30 ? '...' : ''}"` : "(empty)"}
                    </div>
                  </div>
                )}
                
                {/* Audio Input */}
                {inputType === 'audio' && (
                  <AudioInput
                    onAudioCaptured={(blob, url) => {
                      setAudioBlob(blob);
                      setAudioUrl(url);
                    }}
                    onAudioFileSelected={(file) => {
                      // Handle audio file selection
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        if (e.target?.result instanceof ArrayBuffer) {
                          const blob = new Blob([e.target.result], { type: file.type });
                          setAudioBlob(blob);
                          const url = URL.createObjectURL(blob);
                          setAudioUrl(url);
                        }
                      };
                      reader.readAsArrayBuffer(file);
                    }}
                  />
                )}
                
                {/* File Input */}
                {inputType === 'file' && (
                  <FileInput
                    onFilesSelected={(filesWithContent) => {
                      setSelectedFiles(filesWithContent);
                      
                      // Log extracted content for debugging
                      filesWithContent.forEach(f => {
                        if (f.content) {
                          console.log(`Extracted content from ${f.file.name}:`,
                            f.content.length > 100 ? f.content.substring(0, 100) + '...' : f.content);
                        }
                        if (f.error) {
                          console.error(`Error extracting content from ${f.file.name}:`, f.error);
                        }
                      });
                    }}
                    extractContent={true} // Enable content extraction
                  />
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Process with:
                </label>
                
                <div className="flex space-x-4 mb-4">
                  {/*<button
                    type="button"
                    onClick={() => setSelectedTarget('modelCard')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      selectedTarget === 'modelCard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Model Card
                  </button>*/}
                  
                  {/*<button
                    type="button"
                    onClick={() => setSelectedTarget('workflow')}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      selectedTarget === 'workflow'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Workflow size={18} className="mr-2" />
                    Workflow
                  </button>*/}
                </div>
                
                {/* Model Card Selection */}
                {selectedTarget === 'modelCard' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Model Card:
                    </label>
                    
                    {isLoadingModelCards ? (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Loading model cards...
                      </div>
                    ) : modelCards.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No model cards available. <Link to="/model-cards/new" className="text-blue-600 dark:text-blue-400 hover:underline">Create one</Link>
                      </div>
                    ) : (
                      <select
                        value={selectedModelCardId}
                        onChange={(e) => setSelectedModelCardId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {/* Remove the empty option to ensure a model card is always selected */}
                        {modelCards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} ({card.llmProvider}/{card.llmModel})
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {selectedModelCardId && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Using {activeProvider} provider with {providers[activeProvider]?.availableModels.length || 0} available models
                      </div>
                    )}
                  </div>
                )}
                
                {/* Workflow Selection */}
                {selectedTarget === 'workflow' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Workflow Execution:
                    </label>
                    
                    {workflows.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No workflows available. <Link to="/workflows" className="text-blue-600 dark:text-blue-400 hover:underline">Create a workflow</Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Select a workflow from the dropdown below and click the "Execute Workflow" button.
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Selected workflow: {selectedWorkflowId ? workflows.find(w => w.id === selectedWorkflowId)?.name || selectedWorkflowId : "None"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Current input: {textInput ? `"${textInput.substring(0, 20)}${textInput.length > 20 ? '...' : ''}"` : "(empty)"}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              console.log("Execute workflow button clicked with input:", textInput);
                              if (selectedWorkflowId && workflowContext?.executeWorkflow) {
                                setIsProcessing(true);
                                // Directly execute the workflow with the current text input
                                workflowContext.executeWorkflow(selectedWorkflowId, textInput)
                                  .then(result => {
                                    console.log("Workflow execution completed:", result);
                                    // Create output from result
                                    const newOutput: Output = {
                                      id: `workflow-${Date.now()}`,
                                      type: 'markdown',
                                      content: result.finalOutput,
                                      usageStatistics: result.totalUsageStatistics,
                                      metadata: {
                                        workflowId: result.workflowId,
                                        workflowName: result.workflowName,
                                        executionTime: result.totalUsageStatistics.executionTime,
                                        timestamp: new Date().toISOString()
                                      }
                                    };
                                    setOutput(newOutput);
                                  })
                                  .catch(err => {
                                    console.error("Error executing workflow:", err);
                                    // Show error in output
                                    setOutput({
                                      id: `error-${Date.now()}`,
                                      type: 'text',
                                      content: `Error executing workflow: ${err instanceof Error ? err.message : String(err)}`,
                                      usageStatistics: {
                                        promptTokens: 0,
                                        completionTokens: 0,
                                        totalTokens: 0,
                                        executionTime: 0,
                                        toolCalls: 0,
                                      },
                                      metadata: {},
                                    });
                                  })
                                  .finally(() => {
                                    setIsProcessing(false);
                                  });
                              }
                            }}
                            disabled={!selectedWorkflowId || isProcessing}
                            className={`w-full flex justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 ${
                              (!selectedWorkflowId || isProcessing) && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isProcessing ? 'Executing...' : 'Execute Workflow Directly'}
                            <Send size={18} className="ml-2" />
                          </button>
                        </div>
                        
                        <WorkflowInputWrapper
                          inputValue={textInput}
                          onInputSubmit={() => {
                            console.log("WorkflowInputWrapper onInputSubmit called with input:", textInput);
                            if (selectedWorkflowId && workflowContext?.executeWorkflow) {
                              setIsProcessing(true);
                              // Directly execute the workflow with the current text input
                              workflowContext.executeWorkflow(selectedWorkflowId, textInput)
                                .then(result => {
                                  console.log("Workflow execution completed:", result);
                                  // Create output from result
                                  const newOutput: Output = {
                                    id: `workflow-${Date.now()}`,
                                    type: 'markdown',
                                    content: result.finalOutput,
                                    usageStatistics: result.totalUsageStatistics,
                                    metadata: {
                                      workflowId: result.workflowId,
                                      workflowName: result.workflowName,
                                      executionTime: result.totalUsageStatistics.executionTime,
                                      timestamp: new Date().toISOString()
                                    }
                                  };
                                  setOutput(newOutput);
                                })
                                .catch(err => {
                                  console.error("Error executing workflow:", err);
                                  // Show error in output
                                  setOutput({
                                    id: `error-${Date.now()}`,
                                    type: 'text',
                                    content: `Error executing workflow: ${err instanceof Error ? err.message : String(err)}`,
                                    usageStatistics: {
                                      promptTokens: 0,
                                      completionTokens: 0,
                                      totalTokens: 0,
                                      executionTime: 0,
                                      toolCalls: 0,
                                    },
                                    metadata: {},
                                  });
                                })
                                .finally(() => {
                                  setIsProcessing(false);
                                });
                            }
                          }}
                          onExecutionComplete={(result: WorkflowExecutionResult) => {
                            // Create an output object from the execution result
                            const newOutput: Output = {
                              id: `workflow-${Date.now()}`,
                              type: 'markdown',
                              content: result.finalOutput,
                              usageStatistics: result.totalUsageStatistics,
                              metadata: {
                                workflowId: result.workflowId,
                                workflowName: result.workflowName,
                                executionTime: result.totalUsageStatistics.executionTime,
                                timestamp: new Date().toISOString()
                              }
                            };
                            
                            setOutput(newOutput);
                            setIsProcessing(false);
                          }}
                          className="mb-4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {selectedTarget === 'modelCard' && (
                <div className="flex justify-end">
                  <div>
                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected model card: {selectedModelCardId ? modelCards.find(c => c.id === selectedModelCardId)?.name || selectedModelCardId : "None"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Process with Model Card clicked with:", {
                          textInput,
                          selectedModelCardId,
                          inputType
                        });
                        handleSubmit();
                      }}
                      disabled={
                        (inputType === 'text' && !textInput.trim()) ||
                        (inputType === 'audio' && !audioBlob) ||
                        (inputType === 'file' && selectedFiles.length === 0) ||
                        !selectedModelCardId ||
                        isProcessing
                      }
                      className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                        ((inputType === 'text' && !textInput.trim()) ||
                         (inputType === 'audio' && !audioBlob) ||
                         (inputType === 'file' && selectedFiles.length === 0) ||
                         !selectedModelCardId ||
                         isProcessing) && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : 'Process with Model Card'}
                      <Send size={18} className="ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Output Component */}
            {output ? (
              selectedTarget === 'workflow' ? (
                <WorkflowOutputRenderer
                  output={output}
                  onNewSession={resetSession}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Output
                    </h2>
                    <button
                      onClick={resetSession}
                      className="flex items-center py-2 px-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      <span className="font-medium">New Session</span>
                    </button>
                  </div>
                  <OutputRenderer output={output} />
                </div>
              )
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Output
                </h2>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Output will appear here after processing
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`${action.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start space-x-4`}
              >
                <div className="flex-shrink-0">{action.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Getting Started
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">Create a Model Card</span> - Define parameters and
              capabilities for your AI model
            </li>
            <li>
              <span className="font-medium">Configure Inputs</span> - Set up text, file, or audio
              inputs for your model
            </li>
            <li>
              <span className="font-medium">Connect to MCP Servers</span> - Add tool capabilities
              with MCP servers
            </li>
            <li>
              <span className="font-medium">Create Workflows</span> - Connect multiple model cards
              for complex pipelines
            </li>
          </ol>
          <div className="mt-6">
            <Link
              to="/model-cards/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Model Card
              <PlusCircle size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}