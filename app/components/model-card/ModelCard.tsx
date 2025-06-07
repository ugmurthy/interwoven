import React, { useState } from 'react';
import { ModelCard as ModelCardType } from '../../types';

interface ModelCardProps {
  modelCard: ModelCardType;
  onEdit?: () => void;
  onDelete?: () => void;
  onRun?: (input: string) => void;
}

export function ModelCard({ modelCard, onEdit, onDelete, onRun }: ModelCardProps) {
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleRun = () => {
    if (!input.trim() || !onRun) return;
    
    setIsRunning(true);
    onRun(input);
    // In a real implementation, the onRun callback would handle the state
    setTimeout(() => {
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {modelCard.name}
        </h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {modelCard.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Provider: {modelCard.llmProvider}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Model: {modelCard.llmModel}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {modelCard.capabilities.supportsImages && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                Images
              </span>
            )}
            {modelCard.capabilities.supportsAudio && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                Audio
              </span>
            )}
            {modelCard.capabilities.supportsFiles && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                Files
              </span>
            )}
            {modelCard.capabilities.supportsTools && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                Tools
              </span>
            )}
          </div>
        </div>

        {/* Show more details when expanded */}
        {expanded && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {modelCard.parameters.map((param) => (
                <div key={param.id} className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{param.name}: </span>
                  <span className="text-gray-600 dark:text-gray-400">{param.value}</span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Settings
            </h4>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
              {JSON.stringify(modelCard.settings, null, 2)}
            </pre>

            {modelCard.mcpServers && modelCard.mcpServers.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                  Connected MCP Servers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {modelCard.mcpServers.map((serverId) => (
                    <span
                      key={serverId}
                      className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded"
                    >
                      {serverId}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 dark:text-blue-400 mt-2"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>

        {/* Input and Run button */}
        {onRun && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              placeholder="Enter input for this model card..."
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleRun}
                disabled={!input.trim() || isRunning}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm ${
                  (!input.trim() || isRunning) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}