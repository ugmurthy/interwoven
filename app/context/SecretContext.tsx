import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Secret, SecretService } from '../services/secret/SecretService';

// Define the context type
interface SecretContextType {
  secrets: Secret[];
  environmentVariables: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  refreshSecrets: () => Promise<void>;
  refreshEnvironmentVariables: () => Promise<void>;
  addSecret: (secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Secret>;
  updateSecret: (id: string, secret: Partial<Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Secret>;
  removeSecret: (id: string) => Promise<void>;
  setEnvironmentVariable: (name: string, value: string) => Promise<void>;
  removeEnvironmentVariable: (name: string) => Promise<void>;
}

// Create the context
const SecretContext = createContext<SecretContextType | undefined>(undefined);

// Create the provider component
interface SecretProviderProps {
  children: ReactNode;
  secretService: SecretService;
}

export const SecretProvider: React.FC<SecretProviderProps> = ({ children, secretService }) => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load secrets and environment variables on mount
  useEffect(() => {
    refreshSecrets();
    refreshEnvironmentVariables();
  }, []);

  // Refresh the list of secrets
  const refreshSecrets = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const secretList = await secretService.getSecrets();
      setSecrets(secretList);
    } catch (err) {
      setError('Failed to load secrets');
      console.error('Error loading secrets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh the environment variables
  const refreshEnvironmentVariables = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const envVars = await secretService.getEnvironmentVariables();
      setEnvironmentVariables(envVars);
    } catch (err) {
      setError('Failed to load environment variables');
      console.error('Error loading environment variables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new secret
  const addSecret = async (secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>): Promise<Secret> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSecret = await secretService.addSecret(secret);
      setSecrets(prev => [...prev, newSecret]);
      return newSecret;
    } catch (err) {
      setError('Failed to add secret');
      console.error('Error adding secret:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing secret
  const updateSecret = async (
    id: string, 
    secret: Partial<Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Secret> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedSecret = await secretService.updateSecret(id, secret);
      setSecrets(prev => prev.map(s => s.id === id ? updatedSecret : s));
      return updatedSecret;
    } catch (err) {
      setError(`Failed to update secret ${id}`);
      console.error(`Error updating secret ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a secret
  const removeSecret = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await secretService.removeSecret(id);
      setSecrets(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(`Failed to remove secret ${id}`);
      console.error(`Error removing secret ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Set an environment variable
  const setEnvironmentVariable = async (name: string, value: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await secretService.setEnvironmentVariable(name, value);
      setEnvironmentVariables(prev => ({ ...prev, [name]: value }));
    } catch (err) {
      setError(`Failed to set environment variable ${name}`);
      console.error(`Error setting environment variable ${name}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an environment variable
  const removeEnvironmentVariable = async (name: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await secretService.removeEnvironmentVariable(name);
      setEnvironmentVariables(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    } catch (err) {
      setError(`Failed to remove environment variable ${name}`);
      console.error(`Error removing environment variable ${name}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    secrets,
    environmentVariables,
    isLoading,
    error,
    refreshSecrets,
    refreshEnvironmentVariables,
    addSecret,
    updateSecret,
    removeSecret,
    setEnvironmentVariable,
    removeEnvironmentVariable,
  };

  return (
    <SecretContext.Provider value={value}>
      {children}
    </SecretContext.Provider>
  );
};

// Create a hook to use the secret context
export const useSecret = () => {
  const context = useContext(SecretContext);
  if (context === undefined) {
    throw new Error('useSecret must be used within a SecretProvider');
  }
  return context;
};