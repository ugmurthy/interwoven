import { StorageService } from '../storage/StorageService';

/**
 * Secret type definition
 */
export interface Secret {
  id: string;
  name: string;
  value: string;
  type: 'api_key' | 'token' | 'password' | 'other';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Secret Service Interface
 * Provides functionality for managing secrets
 */
export interface SecretService {
  /**
   * Get all secrets
   * @returns A promise that resolves to an array of secrets
   */
  getSecrets(): Promise<Secret[]>;
  
  /**
   * Get a secret by ID
   * @param id The ID of the secret
   * @returns A promise that resolves to the secret or null if not found
   */
  getSecret(id: string): Promise<Secret | null>;
  
  /**
   * Get a secret by name
   * @param name The name of the secret
   * @returns A promise that resolves to the secret or null if not found
   */
  getSecretByName(name: string): Promise<Secret | null>;
  
  /**
   * Add a new secret
   * @param secret The secret to add
   * @returns A promise that resolves to the added secret
   */
  addSecret(secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>): Promise<Secret>;
  
  /**
   * Update an existing secret
   * @param id The ID of the secret to update
   * @param secret The updated secret data
   * @returns A promise that resolves to the updated secret
   */
  updateSecret(id: string, secret: Partial<Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Secret>;
  
  /**
   * Remove a secret
   * @param id The ID of the secret to remove
   * @returns A promise that resolves when the secret is removed
   */
  removeSecret(id: string): Promise<void>;
  
  /**
   * Get environment variables
   * @returns A promise that resolves to a record of environment variables
   */
  getEnvironmentVariables(): Promise<Record<string, string>>;
  
  /**
   * Set an environment variable
   * @param name The name of the environment variable
   * @param value The value of the environment variable
   * @returns A promise that resolves when the environment variable is set
   */
  setEnvironmentVariable(name: string, value: string): Promise<void>;
  
  /**
   * Remove an environment variable
   * @param name The name of the environment variable to remove
   * @returns A promise that resolves when the environment variable is removed
   */
  removeEnvironmentVariable(name: string): Promise<void>;
}