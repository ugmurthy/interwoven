import React, { useState } from 'react';
import { ModelCard as ModelCardType } from '../../types';
import { ArrowRight, Settings, Trash2 } from 'lucide-react';

interface ModelCardProps {
  modelCard: ModelCardType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onConnect?: (id: string) => void;
}

export function ModelCard({ modelCard, onEdit, onDelete, onConnect }: ModelCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {modelCard.name}
        </h3>
        
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(modelCard.id)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Edit model card"
            >
              <Settings size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(modelCard.id)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Delete model card"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {modelCard.description}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Provider:</span> {modelCard.llmProvider}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Model:</span> {modelCard.llmModel}
          </div>
        </div>
        
        {/* Expandable Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Parameters
            </h4>
            
            <div className="space-y-2">
              {modelCard.parameters.map((param) => (
                <div key={param.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{param.name}</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {typeof param.value === 'boolean'
                      ? param.value
                        ? 'Yes'
                        : 'No'
                      : param.value.toString()}
                  </span>
                </div>
              ))}
            </div>
            
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
              Capabilities
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${modelCard.capabilities.supportsImages ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Images</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${modelCard.capabilities.supportsAudio ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Audio</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${modelCard.capabilities.supportsFiles ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Files</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${modelCard.capabilities.supportsTools ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600 dark:text-gray-400">Tools</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <button
          onClick={toggleExpanded}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
        
        {onConnect && (
          <button
            onClick={() => onConnect(modelCard.id)}
            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Connect <ArrowRight size={16} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}