import React, { useState } from 'react';
import { ModelCard as ModelCardType, Output } from '../../types';

interface ModelCardRendererProps {
  modelCard: ModelCardType;
  input?: string;
  output?: Output;
  isProcessing?: boolean;
  onProcess?: (input: string) => void;
}

export function ModelCardRenderer({
  modelCard,
  input = '',
  output,
  isProcessing = false,
  onProcess,
}: ModelCardRendererProps) {
  const [currentInput, setCurrentInput] = useState(input);

  const handleProcess = () => {
    if (!currentInput.trim() || !onProcess || isProcessing) return;
    onProcess(currentInput);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {modelCard.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {modelCard.description}
        </p>
      </div>

      {/* Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Input
        </h4>
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your input here..."
          disabled={isProcessing}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleProcess}
            disabled={!currentInput.trim() || isProcessing || !onProcess}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
              (!currentInput.trim() || isProcessing || !onProcess) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="p-4">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Output
        </h4>
        
        {output ? (
          <div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
              {output.content}
            </div>
            
            {/* Tool Responses */}
            {output.toolResponses && output.toolResponses.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Tool Responses
                </h5>
                <div className="space-y-2">
                  {output.toolResponses.map((toolResponse) => (
                    <div
                      key={toolResponse.toolId}
                      className="bg-gray-100 dark:bg-gray-900 rounded-md p-3 text-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {toolResponse.toolName}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            toolResponse.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : toolResponse.status === 'error'
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {toolResponse.status}
                        </span>
                      </div>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(toolResponse.response, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Usage Statistics */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Prompt Tokens: {output.usageStatistics.promptTokens}</span>
                <span>Completion Tokens: {output.usageStatistics.completionTokens}</span>
                <span>Total Tokens: {output.usageStatistics.totalTokens}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Execution Time: {output.usageStatistics.executionTime}ms</span>
                <span>Tool Calls: {output.usageStatistics.toolCalls}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Output will appear here after processing
          </div>
        )}
      </div>
    </div>
  );
}