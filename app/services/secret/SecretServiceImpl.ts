import { v4 as uuidv4 } from 'uuid';
import { Secret, SecretService } from './SecretService';
import { StorageService } from '../storage/StorageService';

/**
 * Secret Service Implementation
 * Implements the secret service interface
 */
export class SecretServiceImpl implements SecretService {
  private storageService: StorageService;
  private secretsKey: string = 'secrets';
  private envVarsKey: string = 'env-vars';
  
  /**
   * Create a new SecretServiceImpl
   * @param storageService The storage service to use
   */
  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }
  
  /**
   * Get all secrets
   * @returns A promise that resolves to an array of secrets
   */
  async getSecrets(): Promise<Secret[]> {
    const secrets = await this.storageService.getItem<Secret[]>(this.secretsKey);
    return secrets || [];
  }
  
  /**
   * Get a secret by ID
   * @param id The ID of the secret
   * @returns A promise that resolves to the secret or null if not found
   */
  async getSecret(id: string): Promise<Secret | null> {
    const secrets = await this.getSecrets();
    return secrets.find(secret => secret.id === id) || null;
  }
  
  /**
   * Get a secret by name
   * @param name The name of the secret
   * @returns A promise that resolves to the secret or null if not found
   */
  async getSecretByName(name: string): Promise<Secret | null> {
    const secrets = await this.getSecrets();
    return secrets.find(secret => secret.name === name) || null;
  }
  
  /**
   * Add a new secret
   * @param secret The secret to add
   * @returns A promise that resolves to the added secret
   */
  async addSecret(secret: Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>): Promise<Secret> {
    const secrets = await this.getSecrets();
    
    // Check if a secret with the same name already exists
    const existingSecret = secrets.find(s => s.name === secret.name);
    if (existingSecret) {
      throw new Error(`Secret with name ${secret.name} already exists`);
    }
    
    const newSecret: Secret = {
      ...secret,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(this.secretsKey, [...secrets, newSecret]);
    
    return newSecret;
  }
  
  /**
   * Update an existing secret
   * @param id The ID of the secret to update
   * @param secret The updated secret data
   * @returns A promise that resolves to the updated secret
   */
  async updateSecret(id: string, secret: Partial<Omit<Secret, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Secret> {
    const secrets = await this.getSecrets();
    const existingSecret = secrets.find(s => s.id === id);
    
    if (!existingSecret) {
      throw new Error(`Secret with ID ${id} not found`);
    }
    
    // Check if name is being updated and if it conflicts with an existing secret
    if (secret.name && secret.name !== existingSecret.name) {
      const nameConflict = secrets.find(s => s.name === secret.name && s.id !== id);
      if (nameConflict) {
        throw new Error(`Secret with name ${secret.name} already exists`);
      }
    }
    
    const updatedSecret: Secret = {
      ...existingSecret,
      ...secret,
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(
      this.secretsKey,
      secrets.map(s => (s.id === id ? updatedSecret : s))
    );
    
    return updatedSecret;
  }
  
  /**
   * Remove a secret
   * @param id The ID of the secret to remove
   * @returns A promise that resolves when the secret is removed
   */
  async removeSecret(id: string): Promise<void> {
    const secrets = await this.getSecrets();
    
    await this.storageService.setItem(
      this.secretsKey,
      secrets.filter(secret => secret.id !== id)
    );
  }
  
  /**
   * Get environment variables
   * @returns A promise that resolves to a record of environment variables
   */
  async getEnvironmentVariables(): Promise<Record<string, string>> {
    const envVars = await this.storageService.getItem<Record<string, string>>(this.envVarsKey);
    return envVars || {};
  }
  
  /**
   * Set an environment variable
   * @param name The name of the environment variable
   * @param value The value of the environment variable
   * @returns A promise that resolves when the environment variable is set
   */
  async setEnvironmentVariable(name: string, value: string): Promise<void> {
    const envVars = await this.getEnvironmentVariables();
    
    await this.storageService.setItem(
      this.envVarsKey,
      {
        ...envVars,
        [name]: value,
      }
    );
  }
  
  /**
   * Remove an environment variable
   * @param name The name of the environment variable to remove
   * @returns A promise that resolves when the environment variable is removed
   */
  async removeEnvironmentVariable(name: string): Promise<void> {
    const envVars = await this.getEnvironmentVariables();
    
    if (!(name in envVars)) {
      return;
    }
    
    const updatedEnvVars = { ...envVars };
    delete updatedEnvVars[name];
    
    await this.storageService.setItem(this.envVarsKey, updatedEnvVars);
  }
}