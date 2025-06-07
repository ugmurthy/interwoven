/**
 * Storage Service Interface
 * Provides an abstraction layer for different storage mechanisms
 */
export interface StorageService {
  /**
   * Get an item from storage
   * @param key The key to get
   * @returns A promise that resolves to the item or null if not found
   */
  getItem<T>(key: string): Promise<T | null>;
  
  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to set
   * @returns A promise that resolves when the item is set
   */
  setItem<T>(key: string, value: T): Promise<void>;
  
  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns A promise that resolves when the item is removed
   */
  removeItem(key: string): Promise<void>;
  
  /**
   * Clear all items from storage
   * @returns A promise that resolves when all items are cleared
   */
  clear(): Promise<void>;
  
  /**
   * Get all keys in storage
   * @returns A promise that resolves to an array of keys
   */
  keys(): Promise<string[]>;
}

/**
 * Abstract base class for storage service implementations
 */
export abstract class BaseStorageService implements StorageService {
  abstract getItem<T>(key: string): Promise<T | null>;
  abstract setItem<T>(key: string, value: T): Promise<void>;
  abstract removeItem(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract keys(): Promise<string[]>;
}