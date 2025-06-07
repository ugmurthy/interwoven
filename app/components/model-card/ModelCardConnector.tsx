import React, { useState, useEffect } from 'react';
import { ModelCard, Connection } from '../../types';

interface ModelCardConnectorProps {
  sourceCard: ModelCard;
  availableTargets: ModelCard[];
  existingConnections: Connection[];
  onConnect: (sourceId: string, targetId: string, type: Connection['type']) => void;
  onDisconnect: (connectionId: string) => void;
  onValidateConnection?: (sourceId: string, targetId: string, type: Connection['type']) => boolean;
}

export function ModelCardConnector({
  sourceCard,
  availableTargets,
  existingConnections,
  onConnect,
  onDisconnect,
  onValidateConnection,
}: ModelCardConnectorProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [connectionType, setConnectionType] = useState<Connection['type']>('model-to-model');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dataFlowPreview, setDataFlowPreview] = useState<string | null>(null);

  // Reset validation error when selection changes
  useEffect(() => {
    setValidationError(null);
    setDataFlowPreview(null);
  }, [selectedTarget, connectionType]);

  // Generate data flow preview when selection changes
  useEffect(() => {
    if (!selectedTarget) return;
    
    const targetCard = availableTargets.find(target => target.id === selectedTarget);
    if (!targetCard) return;
    
    // Generate a preview of the data flow between the cards
    let preview = '';
    
    switch (connectionType) {
      case 'model-to-model':
        preview = `${sourceCard.name} will send its output to ${targetCard.name}`;
        break;
      case 'model-to-output':
        preview = `${sourceCard.name} will display its output in ${targetCard.name}`;
        break;
      case 'input-to-model':
        preview = `${sourceCard.name} will provide input to ${targetCard.name}`;
        break;
    }
    
    setDataFlowPreview(preview);
  }, [selectedTarget, connectionType, sourceCard, availableTargets]);

  const handleConnect = () => {
    if (!selectedTarget) return;
    
    // Validate the connection if a validation function is provided
    if (onValidateConnection) {
      const isValid = onValidateConnection(sourceCard.id, selectedTarget, connectionType);
      
      if (!isValid) {
        setValidationError('This connection is not valid. It may create a circular reference or connect incompatible cards.');
        return;
      }
    }
    
    // Create the connection
    onConnect(sourceCard.id, selectedTarget, connectionType);
    
    // Reset the form
    setSelectedTarget('');
    setValidationError(null);
    setDataFlowPreview(null);
  };

  // Filter out targets that are already connected to this source
  const filteredTargets = availableTargets.filter(
    (target) =>
      target.id !== sourceCard.id &&
      !existingConnections.some(
        (conn) => conn.sourceId === sourceCard.id && conn.targetId === target.id
      )
  );

  // Get connections where this card is the source
  const cardConnections = existingConnections.filter(
    (conn) => conn.sourceId === sourceCard.id
  );

  // Check if the connection would create a circular reference
  const wouldCreateCircularReference = (targetId: string): boolean => {
    // If target connects back to source, it's circular
    if (existingConnections.some(conn => conn.sourceId === targetId && conn.targetId === sourceCard.id)) {
      return true;
    }
    
    // Check if there's a path from target back to source
    const visited = new Set<string>();
    const queue: string[] = [targetId];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);
      
      // Find all connections where current is the source
      const outgoingConnections = existingConnections.filter(conn => conn.sourceId === current);
      
      for (const conn of outgoingConnections) {
        if (conn.targetId === sourceCard.id) {
          return true; // Found a path back to source
        }
        
        if (!visited.has(conn.targetId)) {
          queue.push(conn.targetId);
        }
      }
    }
    
    return false;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Connect {sourceCard.name}
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Connection Type
        </label>
        <select
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value as Connection['type'])}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="model-to-model">Model to Model</option>
          <option value="model-to-output">Model to Output</option>
          <option value="input-to-model">Input to Model</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target
        </label>
        {filteredTargets.length > 0 ? (
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a target</option>
            {filteredTargets.map((target) => (
              <option 
                key={target.id} 
                value={target.id}
                disabled={wouldCreateCircularReference(target.id)}
              >
                {target.name} {wouldCreateCircularReference(target.id) ? '(would create circular reference)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm p-2 border border-gray-300 dark:border-gray-700 rounded-md">
            No available targets to connect
          </div>
        )}
      </div>

      {dataFlowPreview && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md text-sm">
          {dataFlowPreview}
        </div>
      )}

      {validationError && (
        <div className="mb-4 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
          {validationError}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={handleConnect}
          disabled={!selectedTarget}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
            !selectedTarget && 'opacity-50 cursor-not-allowed'
          }`}
        >
          Connect
        </button>
      </div>

      {cardConnections.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Current Connections
          </h4>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cardConnections.map((connection) => {
              const targetCard = availableTargets.find(
                (card) => card.id === connection.targetId
              );
              return (
                <li key={connection.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {targetCard?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({connection.type})
                    </span>
                  </div>
                  <button
                    onClick={() => onDisconnect(connection.id)}
                    className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
                  >
                    Disconnect
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}