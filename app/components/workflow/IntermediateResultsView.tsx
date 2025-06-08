import React, { useState } from 'react';
import { ExecutionResult, WorkflowExecutionResult } from '../../types';
import { ChevronDown, ChevronRight, Clock, FileText, Zap, MessageSquare, BarChart2, Code } from 'lucide-react';

interface IntermediateResultsViewProps {
  executionResult: WorkflowExecutionResult;
  className?: string;
}

// Define section types for collapsible sections
type SectionType = 'input' | 'systemPrompt' | 'output' | 'usage';

export function IntermediateResultsView({
  executionResult,
  className = '',
}: IntermediateResultsViewProps) {
  // Track expanded state for each model
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  
  // Track expanded state for each section within each model
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<SectionType, boolean>>>({});

  // Toggle expansion of a result
  const toggleExpand = (modelId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
    
    // Initialize section states if this model is being expanded for the first time
    if (!expandedSections[modelId]) {
      setExpandedSections(prev => ({
        ...prev,
        [modelId]: {
          input: false, // Now collapsed by default
          systemPrompt: false, // System prompt is hidden by default
          output: false, // Now collapsed by default
          usage: false // Usage is collapsed by default
        }
      }));
    }
  };
  
  // Toggle expansion of a specific section
  const toggleSection = (modelId: string, section: SectionType) => {
    setExpandedSections(prev => ({
      ...prev,
      [modelId]: {
        ...(prev[modelId] || {
          input: false,
          systemPrompt: false,
          output: false,
          usage: false
        }),
        [section]: !(prev[modelId]?.[section] ?? false)
      }
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
              <div className="p-3 space-y-3">
                {/* Input Section - Collapsible */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/30 cursor-pointer"
                    onClick={() => toggleSection(result.modelId, 'input')}
                  >
                    <div className="flex items-center">
                      {expandedSections[result.modelId]?.input ? (
                        <ChevronDown size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ChevronRight size={14} className="mr-2 text-blue-600 dark:text-blue-400" />
                      )}
                      <span className="font-medium text-blue-700 dark:text-blue-300 flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        Input
                      </span>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {result.input.length} characters
                    </div>
                  </div>
                  
                  {expandedSections[result.modelId]?.input && (
                    <div className="p-2">
                      {/* System Prompt Section - Hidden by default */}
                      <div className="mb-2 border-l-2 border-gray-300 dark:border-gray-600">
                        <div
                          className="flex items-center p-1 pl-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => toggleSection(result.modelId, 'systemPrompt')}
                        >
                          {expandedSections[result.modelId]?.systemPrompt ? (
                            <ChevronDown size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight size={12} className="mr-1 text-gray-500 dark:text-gray-400" />
                          )}
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                            <Code size={12} className="mr-1" />
                            System Prompt
                          </span>
                        </div>
                        
                        {expandedSections[result.modelId]?.systemPrompt && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 ml-2 rounded text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap border-l-2 border-gray-300 dark:border-gray-600">
                            {/* Extract system prompt from input - assuming format: systemPrompt\n\nuserInput */}
                            {result.input.split('\n\n')[0]}
                          </div>
                        )}
                      </div>
                      
                      {/* User Input */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap">
                        {/* Show only user input part */}
                        {result.input.includes('\n\n') ? result.input.split('\n\n').slice(1).join('\n\n') : result.input}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Output Section - Collapsible */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/30 cursor-pointer"
                    onClick={() => toggleSection(result.modelId, 'output')}
                  >
                    <div className="flex items-center">
                      {expandedSections[result.modelId]?.output ? (
                        <ChevronDown size={14} className="mr-2 text-green-600 dark:text-green-400" />
                      ) : (
                        <ChevronRight size={14} className="mr-2 text-green-600 dark:text-green-400" />
                      )}
                      <span className="font-medium text-green-700 dark:text-green-300 flex items-center">
                        <FileText size={14} className="mr-1" />
                        Output
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {result.output.length} characters
                    </div>
                  </div>
                  
                  {expandedSections[result.modelId]?.output && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 text-sm whitespace-pre-wrap">
                      {result.output}
                    </div>
                  )}
                </div>
                
                {/* Usage Statistics Section - Collapsible */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/30 cursor-pointer"
                    onClick={() => toggleSection(result.modelId, 'usage')}
                  >
                    <div className="flex items-center">
                      {expandedSections[result.modelId]?.usage ? (
                        <ChevronDown size={14} className="mr-2 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronRight size={14} className="mr-2 text-purple-600 dark:text-purple-400" />
                      )}
                      <span className="font-medium text-purple-700 dark:text-purple-300 flex items-center">
                        <BarChart2 size={14} className="mr-1" />
                        Usage Statistics
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      {result.usageStatistics.totalTokens} tokens
                    </div>
                  </div>
                  
                  {expandedSections[result.modelId]?.usage && (
                    <div className="grid grid-cols-2 gap-2 p-2 text-xs">
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
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}