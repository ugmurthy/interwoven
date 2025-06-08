import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ArrowLeft } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';
import { TextInput } from '../components/input/TextInput';
import { WorkflowInputWrapper } from '../components/workflow/WorkflowInputWrapper';
import { WorkflowOutputRenderer } from '../components/workflow/WorkflowOutputRenderer';
import { v4 as uuidv4 } from 'uuid';
import { Output, WorkflowExecutionResult } from '../types';

export default function WorkflowExecute() {
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
            Execute Workflow
          </h1>
          <p>Loading workflow execution page...</p>
        </div>
      </Layout>
    );
  }
  
  // Once we're in the browser, render the full component
  return <WorkflowExecuteContent />;
}

// Separate component that uses hooks
function WorkflowExecuteContent() {
  const params = useParams();
  const workflowId = params.id;
  const navigate = useNavigate();
  
  const { workflows, loadWorkflow, currentExecutionResult, isExecuting } = useWorkflow();
  const [workflow, setWorkflow] = useState<any>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load workflow data on mount
  useEffect(() => {
    async function initializeWorkflow() {
      try {
        setIsLoading(true);
        
        if (!workflowId) {
          setError('No workflow ID provided');
          setIsLoading(false);
          return;
        }
        
        console.log(`Loading workflow for execution: ${workflowId}`);
        
        // First try to find the workflow in the current state
        let workflowData = workflows.find(w => w.id === workflowId);
        
        // If not found, try to load it
        if (!workflowData) {
          console.log(`Workflow not in state, loading from storage: ${workflowId}`);
          const loadedWorkflow = await loadWorkflow(workflowId);
          if (loadedWorkflow) {
            workflowData = loadedWorkflow;
          }
        }
        
        if (workflowData) {
          console.log(`Found workflow: ${workflowData.name}`);
          setWorkflow(workflowData);
        } else {
          console.log(`Workflow not found, redirecting to workflows list`);
          setError('Workflow not found');
          // Redirect after a short delay
          setTimeout(() => navigate('/workflows'), 2000);
        }
      } catch (err) {
        console.error('Error in workflow initialization:', err);
        setError(`Error initializing workflow: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeWorkflow();
  }, [workflowId, workflows, loadWorkflow, navigate]);
  
  // Handle execution completion
  const handleExecutionComplete = (result: WorkflowExecutionResult) => {
    // Create an output object from the execution result
    const newOutput: Output = {
      id: uuidv4(),
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
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Execute Workflow
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
            Execute Workflow: {workflow?.name || 'Unknown'}
          </h1>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {workflow && (
          <div className="space-y-6">
            {/* Workflow description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Workflow Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {workflow.description || 'No description provided'}
              </p>
              <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Models:</span> {workflow.modelCards.length}
                </div>
                <div>
                  <span className="font-medium">Connections:</span> {workflow.connections.length}
                </div>
              </div>
            </div>
            
            {/* Input section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Input
              </h2>
              <WorkflowInputWrapper onExecutionComplete={handleExecutionComplete}>
                <TextInput
                  placeholder="Enter your input for the workflow..."
                  rows={6}
                />
              </WorkflowInputWrapper>
            </div>
            
            {/* Output section */}
            {(output || currentExecutionResult) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Output
                </h2>
                {output && <WorkflowOutputRenderer output={output} />}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}