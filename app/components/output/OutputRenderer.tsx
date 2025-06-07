import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Output } from '../../types';
import { Copy, Download, Code, FileText } from 'lucide-react';

interface OutputRendererProps {
  output: Output;
  className?: string;
}

export function OutputRenderer({ output, className = '' }: OutputRendererProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.content);
  };

  const downloadAsText = () => {
    const blob = new Blob([output.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([output.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Output
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
            title="Copy to clipboard"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={downloadAsText}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
            title="Download as text"
          >
            <FileText size={18} />
          </button>
          <button
            onClick={downloadAsMarkdown}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
            title="Download as markdown"
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {output.type === 'markdown' ? (
          <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
            <ReactMarkdown>{output.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {output.content}
          </div>
        )}
      </div>

      {/* Tool Responses */}
      {output.toolResponses && output.toolResponses.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Tool Responses
          </h4>
          <div className="space-y-3">
            {output.toolResponses.map((toolResponse) => (
              <div
                key={toolResponse.toolId}
                className="bg-gray-100 dark:bg-gray-900 rounded-md p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {toolResponse.toolName}
                    </span>
                    {toolResponse.mcpServerId && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        (MCP Server: {toolResponse.mcpServerId})
                      </span>
                    )}
                  </div>
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
                <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(toolResponse.response, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Usage Statistics
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">Prompt Tokens:</span>{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {output.usageStatistics.promptTokens}
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">Completion Tokens:</span>{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {output.usageStatistics.completionTokens}
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">Total Tokens:</span>{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {output.usageStatistics.totalTokens}
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">Execution Time:</span>{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {output.usageStatistics.executionTime}ms
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded">
            <span className="text-gray-500 dark:text-gray-400">Tool Calls:</span>{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {output.usageStatistics.toolCalls}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}