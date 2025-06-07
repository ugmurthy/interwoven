import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModelCard } from '../types';
import { ModelCardService } from '../services/model-card/ModelCardService';
import { seedModelCards } from '../utils/seedData';

// Define the context type
interface ModelCardContextType {
  modelCards: ModelCard[];
  isLoading: boolean;
  error: string | null;
  refreshModelCards: () => Promise<void>;
  getModelCard: (id: string) => Promise<ModelCard | null>;
  createModelCard: (modelCard: Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ModelCard>;
  updateModelCard: (id: string, modelCard: Partial<Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<ModelCard>;
  deleteModelCard: (id: string) => Promise<void>;
}

// Create the context
const ModelCardContext = createContext<ModelCardContextType | undefined>(undefined);

// Create the provider component
interface ModelCardProviderProps {
  children: ReactNode;
  modelCardService: ModelCardService;
}

export const ModelCardProvider: React.FC<ModelCardProviderProps> = ({ children, modelCardService }) => {
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load model cards on mount and seed if needed
  useEffect(() => {
    const initializeModelCards = async () => {
      try {
        // Seed model cards if needed
        await seedModelCards(modelCardService);
        // Then refresh to load the cards
        await refreshModelCards();
      } catch (err) {
        console.error('Error initializing model cards:', err);
        setError('Failed to initialize model cards');
      }
    };
    
    initializeModelCards();
  }, [modelCardService]);

  // Refresh the list of model cards
  const refreshModelCards = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cards = await modelCardService.getModelCards();
      setModelCards(cards);
    } catch (err) {
      setError('Failed to load model cards');
      console.error('Error loading model cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a model card by ID
  const getModelCard = async (id: string): Promise<ModelCard | null> => {
    try {
      return await modelCardService.getModelCard(id);
    } catch (err) {
      setError(`Failed to get model card ${id}`);
      console.error(`Error getting model card ${id}:`, err);
      return null;
    }
  };

  // Create a new model card
  const createModelCard = async (modelCard: Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelCard> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCard = await modelCardService.createModelCard(modelCard);
      setModelCards(prev => [...prev, newCard]);
      return newCard;
    } catch (err) {
      setError('Failed to create model card');
      console.error('Error creating model card:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing model card
  const updateModelCard = async (
    id: string, 
    modelCard: Partial<Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ModelCard> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCard = await modelCardService.updateModelCard(id, modelCard);
      setModelCards(prev => prev.map(card => card.id === id ? updatedCard : card));
      return updatedCard;
    } catch (err) {
      setError(`Failed to update model card ${id}`);
      console.error(`Error updating model card ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a model card
  const deleteModelCard = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await modelCardService.deleteModelCard(id);
      setModelCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      setError(`Failed to delete model card ${id}`);
      console.error(`Error deleting model card ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    modelCards,
    isLoading,
    error,
    refreshModelCards,
    getModelCard,
    createModelCard,
    updateModelCard,
    deleteModelCard,
  };

  return (
    <ModelCardContext.Provider value={value}>
      {children}
    </ModelCardContext.Provider>
  );
};

// Create a hook to use the model card context
export const useModelCard = () => {
  const context = useContext(ModelCardContext);
  if (context === undefined) {
    throw new Error('useModelCard must be used within a ModelCardProvider');
  }
  return context;
};