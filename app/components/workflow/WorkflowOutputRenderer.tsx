import React, { useState } from 'react';
import { Output } from '../../types';
import { OutputRenderer } from '../output/OutputRenderer';
import { IntermediateResultsView } from './IntermediateResultsView';
import { useWorkflow } from '../../context/WorkflowContext';
import { ChevronDown, ChevronRight, Info, RefreshCw } from 'lucide-react';

interface WorkflowOutputRendererProps {
  output: Output;
  className?: string;
  onNewSession?: () => void;
}

export function WorkflowOutputRenderer({
  output,
  className = '',
  onNewSession
}: WorkflowOutputRendererProps) {
  const { currentExecutionResult } = useWorkflow();
  const [showIntermediateResults, setShowIntermediateResults] = useState(false);

  // Toggle intermediate results view
  const toggleIntermediateResults = () => {
    setShowIntermediateResults(prev => !prev);
  };

  return (
    <div className={`workflow-output-renderer ${className}`}>
      {/* Header with execution details button and new session button */}
      {currentExecutionResult && (
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={toggleIntermediateResults}
            className="flex items-center py-2 px-4 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            {showIntermediateResults ? (
              <ChevronDown size={16} className="mr-2" />
            ) : (
              <ChevronRight size={16} className="mr-2" />
            )}
            <Info size={16} className="mr-2" />
            <span className="font-medium">
              Workflow Execution Details ({currentExecutionResult.results.length} models)
            </span>
          </button>
          
          {onNewSession && (
            <button
              onClick={onNewSession}
              className="flex items-center py-2 px-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              <span className="font-medium">New Session</span>
            </button>
          )}
        </div>
      )}
      
      {/* Intermediate results view */}
      {currentExecutionResult && showIntermediateResults && (
        <div className="mb-4">
          <IntermediateResultsView executionResult={currentExecutionResult} />
        </div>
      )}
      
      {/* Regular output */}
      <OutputRenderer output={output} />
    </div>
  );
}