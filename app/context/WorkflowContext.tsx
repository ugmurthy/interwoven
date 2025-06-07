import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ModelCard, Connection, Tool, ToolResponse } from '../types';
import { StorageService } from '../services/storage/StorageService';

// Define the Workflow type
export interface Workflow {
  id: string;
  name: string;
  description: string;
  modelCards: ModelCard[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the context type
interface WorkflowContextType {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  createWorkflow: (name: string, description: string) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>) => Workflow | null;
  deleteWorkflow: (id: string) => void;
  addModelCard: (modelCard: ModelCard) => void;
  removeModelCard: (modelCardId: string) => void;
  createConnection: (sourceId: string, targetId: string, type: Connection['type']) => Connection | null;
  removeConnection: (connectionId: string) => void;
  validateConnection: (sourceId: string, targetId: string, type: Connection['type']) => boolean;
  executeWorkflow: (input: string) => Promise<any>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<Workflow | null>;
}

// Create the context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Helper function to safely parse dates
function parseDateSafely(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  
  try {
    const date = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateStr}, using current date instead`);
      return new Date();
    }
    return date;
  } catch (error) {
    console.warn(`Error parsing date: ${dateStr}`, error);
    return new Date();
  }
}

// Create the provider component
interface WorkflowProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children, storageService }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const storageKey = 'workflows';

  // Load workflows from storage on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        console.log('Loading workflows from storage');
        const storedWorkflows = await storageService.getItem<any[]>(storageKey);
        
        if (storedWorkflows && Array.isArray(storedWorkflows)) {
          // Convert date strings back to Date objects and ensure all required properties exist
          const parsedWorkflows = storedWorkflows.map(workflow => {
            // Ensure modelCards is an array
            const modelCards = Array.isArray(workflow.modelCards) ? workflow.modelCards : [];
            
            // Ensure connections is an array
            const connections = Array.isArray(workflow.connections) ? workflow.connections : [];
            
            return {
              ...workflow,
              modelCards,
              connections,
              createdAt: parseDateSafely(workflow.createdAt),
              updatedAt: parseDateSafely(workflow.updatedAt),
            };
          });
          
          console.log(`Loaded ${parsedWorkflows.length} workflows`);
          setWorkflows(parsedWorkflows);
        } else {
          console.log('No workflows found in storage, initializing with empty array');
          setWorkflows([]);
        }
      } catch (error) {
        console.error('Error loading workflows:', error);
        // Initialize with empty array on error
        setWorkflows([]);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadWorkflows();
  }, [storageService]);

  // Save workflows to storage when they change
  useEffect(() => {
    if (!isInitialized) return; // Skip initial render
    
    const saveWorkflows = async () => {
      try {
        console.log(`Saving ${workflows.length} workflows to storage`);
        await storageService.setItem(storageKey, workflows);
      } catch (error) {
        console.error('Error saving workflows:', error);
      }
    };
    
    if (workflows.length > 0) {
      saveWorkflows();
    }
  }, [workflows, storageService, isInitialized]);

  // Create a new workflow
  const createWorkflow = (name: string, description: string): Workflow => {
    try {
      console.log(`Creating new workflow: ${name}`);
      const newWorkflow: Workflow = {
        id: uuidv4(),
        name,
        description,
        modelCards: [],
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setWorkflows(prev => [...prev, newWorkflow]);
      setCurrentWorkflow(newWorkflow);
      return newWorkflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };

  // Update an existing workflow
  const updateWorkflow = (id: string, updates: Partial<Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>>): Workflow | null => {
    try {
      console.log(`Updating workflow: ${id}`);
      let updatedWorkflow: Workflow | null = null;
      
      setWorkflows(prev => {
        const index = prev.findIndex(w => w.id === id);
        if (index === -1) return prev;
        
        const workflow = prev[index];
        updatedWorkflow = {
          ...workflow,
          ...updates,
          updatedAt: new Date(),
        };
        
        const newWorkflows = [...prev];
        newWorkflows[index] = updatedWorkflow;
        return newWorkflows;
      });
      
      if (currentWorkflow?.id === id && updatedWorkflow) {
        setCurrentWorkflow(updatedWorkflow);
      }
      
      return updatedWorkflow;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      return null;
    }
  };

  // Delete a workflow
  const deleteWorkflow = (id: string): void => {
    try {
      console.log(`Deleting workflow: ${id}`);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      
      if (currentWorkflow?.id === id) {
        setCurrentWorkflow(null);
      }
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw error;
    }
  };

  // Add a model card to the current workflow
  const addModelCard = (modelCard: ModelCard): void => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot add model card: No workflow selected');
        return;
      }
      
      console.log(`Adding model card to workflow ${currentWorkflow.id}: ${modelCard.id}`);
      const updatedWorkflow = {
        ...currentWorkflow,
        modelCards: [...currentWorkflow.modelCards, modelCard],
        updatedAt: new Date(),
      };
      
      setCurrentWorkflow(updatedWorkflow);
      setWorkflows(prev => 
        prev.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w)
      );
    } catch (error) {
      console.error('Error adding model card:', error);
      throw error;
    }
  };

  // Remove a model card from the current workflow
  const removeModelCard = (modelCardId: string): void => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot remove model card: No workflow selected');
        return;
      }
      
      console.log(`Removing model card from workflow ${currentWorkflow.id}: ${modelCardId}`);
      
      // Remove the model card
      const updatedModelCards = currentWorkflow.modelCards.filter(card => card.id !== modelCardId);
      
      // Remove any connections involving this model card
      const updatedConnections = currentWorkflow.connections.filter(
        conn => conn.sourceId !== modelCardId && conn.targetId !== modelCardId
      );
      
      const updatedWorkflow = {
        ...currentWorkflow,
        modelCards: updatedModelCards,
        connections: updatedConnections,
        updatedAt: new Date(),
      };
      
      setCurrentWorkflow(updatedWorkflow);
      setWorkflows(prev => 
        prev.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w)
      );
    } catch (error) {
      console.error(`Error removing model card ${modelCardId}:`, error);
      throw error;
    }
  };

  // Create a connection between model cards
  const createConnection = (sourceId: string, targetId: string, type: Connection['type']): Connection | null => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot create connection: No workflow selected');
        return null;
      }
      
      console.log(`Creating connection in workflow ${currentWorkflow.id}: ${sourceId} -> ${targetId} (${type})`);
      
      // Validate the connection
      if (!validateConnection(sourceId, targetId, type)) {
        console.warn('Connection validation failed');
        return null;
      }
      
      const newConnection: Connection = {
        id: uuidv4(),
        sourceId,
        targetId,
        type,
      };
      
      const updatedWorkflow = {
        ...currentWorkflow,
        connections: [...currentWorkflow.connections, newConnection],
        updatedAt: new Date(),
      };
      
      setCurrentWorkflow(updatedWorkflow);
      setWorkflows(prev => 
        prev.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w)
      );
      
      return newConnection;
    } catch (error) {
      console.error('Error creating connection:', error);
      return null;
    }
  };

  // Remove a connection
  const removeConnection = (connectionId: string): void => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot remove connection: No workflow selected');
        return;
      }
      
      console.log(`Removing connection from workflow ${currentWorkflow.id}: ${connectionId}`);
      
      const updatedWorkflow = {
        ...currentWorkflow,
        connections: currentWorkflow.connections.filter(conn => conn.id !== connectionId),
        updatedAt: new Date(),
      };
      
      setCurrentWorkflow(updatedWorkflow);
      setWorkflows(prev => 
        prev.map(w => w.id === currentWorkflow.id ? updatedWorkflow : w)
      );
    } catch (error) {
      console.error(`Error removing connection ${connectionId}:`, error);
      throw error;
    }
  };

  // Validate a connection between model cards
  const validateConnection = (sourceId: string, targetId: string, type: Connection['type']): boolean => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot validate connection: No workflow selected');
        return false;
      }
      
      // Check if source and target exist
      const sourceCard = currentWorkflow.modelCards.find(card => card.id === sourceId);
      const targetCard = currentWorkflow.modelCards.find(card => card.id === targetId);
      if (!sourceCard || !targetCard) {
        console.warn('Source or target card not found');
        return false;
      }
      
      // Check if connection already exists
      const connectionExists = currentWorkflow.connections.some(
        conn => conn.sourceId === sourceId && conn.targetId === targetId
      );
      if (connectionExists) {
        console.warn('Connection already exists');
        return false;
      }
      
      // Check for circular connections
      if (hasCircularConnection(sourceId, targetId)) {
        console.warn('Circular connection detected');
        return false;
      }
      
      // Validate based on connection type
      switch (type) {
        case 'model-to-model':
          // Both must be model cards
          return true;
        case 'input-to-model':
          // Source must be an input component
          console.warn('input-to-model connections not implemented yet');
          return false; // Not implemented yet
        case 'model-to-output':
          // Target must be an output component
          console.warn('model-to-output connections not implemented yet');
          return false; // Not implemented yet
        default:
          console.warn(`Unknown connection type: ${type}`);
          return false;
      }
    } catch (error) {
      console.error('Error validating connection:', error);
      return false;
    }
  };

  // Check for circular connections
  const hasCircularConnection = (sourceId: string, targetId: string): boolean => {
    try {
      // If target connects back to source, it's circular
      if (sourceId === targetId) return true;
      
      // Check if there's a path from target back to source
      const visited = new Set<string>();
      const queue: string[] = [targetId];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        visited.add(current);
        
        // Find all connections where current is the source
        const outgoingConnections = currentWorkflow!.connections.filter(conn => conn.sourceId === current);
        
        for (const conn of outgoingConnections) {
          if (conn.targetId === sourceId) {
            return true; // Found a path back to source
          }
          
          if (!visited.has(conn.targetId)) {
            queue.push(conn.targetId);
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for circular connections:', error);
      return true; // Assume circular on error to be safe
    }
  };

  // Execute the workflow
  const executeWorkflow = async (input: string): Promise<any> => {
    try {
      if (!currentWorkflow) {
        throw new Error('No workflow selected');
      }
      
      console.log(`Executing workflow ${currentWorkflow.name} with input: ${input}`);
      
      // This is a placeholder implementation
      // In a real implementation, this would:
      // 1. Determine the execution order based on connections
      // 2. Execute each model card in order
      // 3. Pass data between model cards based on connections
      // 4. Handle tool execution
      // 5. Return the final output
      
      // Mock execution result
      return {
        success: true,
        output: `Executed workflow ${currentWorkflow.name} with ${currentWorkflow.modelCards.length} model cards and ${currentWorkflow.connections.length} connections.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  };

  // Save the current workflow
  const saveWorkflow = async (): Promise<void> => {
    try {
      if (!currentWorkflow) {
        console.error('Cannot save workflow: No workflow selected');
        return;
      }
      
      console.log(`Saving workflow: ${currentWorkflow.id}`);
      
      setWorkflows(prev => 
        prev.map(w => w.id === currentWorkflow.id ? currentWorkflow : w)
      );
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };

  // Load a workflow
  const loadWorkflow = async (id: string): Promise<Workflow | null> => {
    try {
      console.log(`Loading workflow: ${id}`);
      
      const workflow = workflows.find(w => w.id === id);
      if (workflow) {
        console.log(`Found workflow: ${workflow.name}`);
        setCurrentWorkflow(workflow);
      } else {
        console.log(`Workflow not found: ${id}`);
      }
      return workflow || null;
    } catch (error) {
      console.error(`Error loading workflow ${id}:`, error);
      return null;
    }
  };

  const value = {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    addModelCard,
    removeModelCard,
    createConnection,
    removeConnection,
    validateConnection,
    executeWorkflow,
    saveWorkflow,
    loadWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Create a hook to use the workflow context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};