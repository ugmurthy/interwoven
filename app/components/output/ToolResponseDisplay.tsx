import React, { useState } from 'react';
import { ToolResponse } from '../../types';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface ToolResponseDisplayProps {
  toolResponses: ToolResponse[];
  className?: string;
}

export function ToolResponseDisplay({ toolResponses, className = '' }: ToolResponseDisplayProps) {
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const toggleExpand = (toolId: string) => {
    setExpandedTools({
      ...expandedTools,
      [toolId]: !expandedTools[toolId],
    });
  };

  // Group tool responses by status
  const groupedResponses: Record<string, ToolResponse[]> = {
    success: [],
    error: [],
    pending: [],
  };

  toolResponses.forEach((response) => {
    groupedResponses[response.status].push(response);
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Tool Responses ({toolResponses.length})
        </h3>
      </div>

      <div className="p-4">
        {toolResponses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No tool responses available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Successful responses */}
            {groupedResponses.success.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Successful ({groupedResponses.success.length})
                </h4>
                <div className="space-y-2">
                  {groupedResponses.success.map((response) => (
                    <ToolResponseCard
                      key={response.toolId}
                      response={response}
                      isExpanded={!!expandedTools[response.toolId]}
                      onToggleExpand={() => toggleExpand(response.toolId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error responses */}
            {groupedResponses.error.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Errors ({groupedResponses.error.length})
                </h4>
                <div className="space-y-2">
                  {groupedResponses.error.map((response) => (
                    <ToolResponseCard
                      key={response.toolId}
                      response={response}
                      isExpanded={!!expandedTools[response.toolId]}
                      onToggleExpand={() => toggleExpand(response.toolId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending responses */}
            {groupedResponses.pending.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Pending ({groupedResponses.pending.length})
                </h4>
                <div className="space-y-2">
                  {groupedResponses.pending.map((response) => (
                    <ToolResponseCard
                      key={response.toolId}
                      response={response}
                      isExpanded={!!expandedTools[response.toolId]}
                      onToggleExpand={() => toggleExpand(response.toolId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface ToolResponseCardProps {
  response: ToolResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ToolResponseCard({ response, isExpanded, onToggleExpand }: ToolResponseCardProps) {
  const statusColor = 
    response.status === 'success'
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      : response.status === 'error'
      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <div 
        className="p-3 bg-gray-50 dark:bg-gray-850 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-800 dark:text-gray-200 mr-2">
            {response.toolName}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
            {response.status}
          </span>
          {response.mcpServerId && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              MCP: {response.mcpServerId}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {new Date(response.timestamp).toLocaleTimeString()}
          </span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(response.response, null, 2)}
          </pre>
          
          {/* If the response contains URLs, display them as clickable links */}
          {typeof response.response === 'object' && response.response !== null && (
            <div className="mt-2">
              {Object.entries(response.response).map(([key, value]) => {
                if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
                  return (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      <ExternalLink size={12} className="mr-1" />
                      {key}: {value}
                    </a>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}