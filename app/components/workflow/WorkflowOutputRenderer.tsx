import React, { useState } from 'react';
import { Output } from '../../types';
import { OutputRenderer } from '../output/OutputRenderer';
import { IntermediateResultsView } from './IntermediateResultsView';
import { useWorkflow } from '../../context/WorkflowContext';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface WorkflowOutputRendererProps {
  output: Output;
  className?: string;
}

export function WorkflowOutputRenderer({ output, className = '' }: WorkflowOutputRendererProps) {
  const { currentExecutionResult } = useWorkflow();
  const [showIntermediateResults, setShowIntermediateResults] = useState(false);

  // Toggle intermediate results view
  const toggleIntermediateResults = () => {
    setShowIntermediateResults(prev => !prev);
  };

  return (
    <div className={`workflow-output-renderer ${className}`}>
      {/* Regular output */}
      <OutputRenderer output={output} />
      
      {/* Workflow execution results */}
      {currentExecutionResult && (
        <div className="mt-4">
          <button
            onClick={toggleIntermediateResults}
            className="flex items-center w-full p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            {showIntermediateResults ? (
              <ChevronDown size={18} className="mr-2" />
            ) : (
              <ChevronRight size={18} className="mr-2" />
            )}
            <Info size={18} className="mr-2" />
            <span className="font-medium">
              View Workflow Execution Details ({currentExecutionResult.results.length} models)
            </span>
          </button>
          
          {showIntermediateResults && (
            <div className="mt-4">
              <IntermediateResultsView executionResult={currentExecutionResult} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}