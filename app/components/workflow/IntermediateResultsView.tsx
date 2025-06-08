import React, { useState } from 'react';
import { ExecutionResult, WorkflowExecutionResult } from '../../types';
import { ChevronDown, ChevronRight, Clock, FileText, Zap } from 'lucide-react';

interface IntermediateResultsViewProps {
  executionResult: WorkflowExecutionResult;
  className?: string;
}

export function IntermediateResultsView({
  executionResult,
  className = '',
}: IntermediateResultsViewProps) {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  // Toggle expansion of a result
  const toggleExpand = (modelId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Format duration in milliseconds to a readable format
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const remainingMs = ms % 1000;
    return `${seconds}.${remainingMs}s`;
  };

  return (
    <div className={`intermediate-results ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Workflow Execution Details
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-4">
            <Clock size={14} className="inline mr-1" />
            Started: {formatDate(executionResult.startTime)}
          </span>
          <span>
            <Zap size={14} className="inline mr-1" />
            Duration: {formatDuration(executionResult.totalUsageStatistics.executionTime)}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            {executionResult.workflowName}
          </h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {executionResult.results.length} model{executionResult.results.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Total Tokens:</span> {executionResult.totalUsageStatistics.totalTokens}
            </div>
            <div>
              <span className="font-medium">Prompt Tokens:</span> {executionResult.totalUsageStatistics.promptTokens}
            </div>
            <div>
              <span className="font-medium">Completion Tokens:</span> {executionResult.totalUsageStatistics.completionTokens}
            </div>
            <div>
              <span className="font-medium">Tool Calls:</span> {executionResult.totalUsageStatistics.toolCalls}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {executionResult.results.map((result, index) => (
          <div 
            key={result.modelId} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <div 
              className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onClick={() => toggleExpand(result.modelId)}
            >
              <div className="flex items-center">
                {expandedResults[result.modelId] ? (
                  <ChevronDown size={16} className="mr-2" />
                ) : (
                  <ChevronRight size={16} className="mr-2" />
                )}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {index + 1}. {result.modelName}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <Clock size={14} className="inline mr-1" />
                {formatDate(result.timestamp)}
              </div>
            </div>
            
            {expandedResults[result.modelId] && (
              <div className="p-3">
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Input
                  </h5>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">
                    {result.input}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Output
                  </h5>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">
                    {result.output}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usage Statistics
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Prompt Tokens:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {result.usageStatistics.promptTokens}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Completion Tokens:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {result.usageStatistics.completionTokens}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Total Tokens:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {result.usageStatistics.totalTokens}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">Tool Calls:</span>{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {result.usageStatistics.toolCalls}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}