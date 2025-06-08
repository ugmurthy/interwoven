import React, { useState, ReactNode, useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { Send } from 'lucide-react';

interface WorkflowInputWrapperProps {
  children: ReactNode;
  onExecutionComplete?: (result: any) => void;
  className?: string;
}

export function WorkflowInputWrapper({
  children,
  onExecutionComplete,
  className = '',
}: WorkflowInputWrapperProps) {
  const { workflows, executeWorkflow, isExecuting } = useWorkflow();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Handle workflow selection
  const handleWorkflowSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkflowId(e.target.value);
  };

  // Handle input submission
  const handleSubmit = async (input: string) => {
    if (!selectedWorkflowId) {
      setError('Please select a workflow');
      return;
    }

    if (!input || input.trim() === '') {
      setError('Please enter some input text');
      return;
    }

    setError(null);
    
    try {
      // Update the input value state
      setInputValue(input);
      
      // Execute the workflow
      const result = await executeWorkflow(selectedWorkflowId, input);
      
      if (onExecutionComplete) {
        onExecutionComplete(result);
      }
    } catch (err) {
      console.error('Error executing workflow:', err);
      setError(`Error executing workflow: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Clone the child component and inject the onSubmit and onChange props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // Check if the child component accepts onSubmit and disabled props
      const childProps: any = {};
      
      // Only add props that the child component might accept
      if ('onSubmit' in child.props) {
        childProps.onSubmit = handleSubmit;
      }
      
      if ('disabled' in child.props) {
        childProps.disabled = isExecuting;
      }
      
      // Add an onChange handler that updates our local state
      if ('onChange' in child.props) {
        const originalOnChange = child.props.onChange;
        childProps.onChange = (value: string) => {
          setInputValue(value);
          if (originalOnChange) {
            originalOnChange(value);
          }
        };
      }
      
      return React.cloneElement(child, childProps);
    }
    return child;
  });

  // Get input value from child component
  const [inputValue, setInputValue] = useState('');
  
  // Effect to extract input value from child props
  useEffect(() => {
    if (React.isValidElement(children) && children.props.initialValue) {
      setInputValue(children.props.initialValue);
    }
  }, [children]);
  
  // Handle direct submit button click
  const handleSubmitButtonClick = () => {
    handleSubmit(inputValue);
  };

  return (
    <div className={`workflow-input-wrapper ${className}`}>
      {/* Workflow selection dropdown */}
      <div className="mb-4">
        <label htmlFor="workflow-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Workflow
        </label>
        <select
          id="workflow-select"
          value={selectedWorkflowId}
          onChange={handleWorkflowSelection}
          disabled={isExecuting}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a workflow</option>
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name} - {workflow.modelCards.length} models
            </option>
          ))}
        </select>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Input component */}
      {childrenWithProps}
      
      {/* Submit button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmitButtonClick}
          disabled={!selectedWorkflowId || isExecuting}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
            (!selectedWorkflowId || isExecuting) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isExecuting ? 'Executing...' : 'Execute Workflow'}
          <Send size={18} className="ml-2" />
        </button>
      </div>

      {/* Execution status */}
      {isExecuting && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md">
          Executing workflow... Please wait.
        </div>
      )}
    </div>
  );
}