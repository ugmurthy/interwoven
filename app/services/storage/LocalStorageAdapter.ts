import { BaseStorageService } from './StorageService';

/**
 * LocalStorage Adapter
 * Implements the storage service interface using browser's localStorage
 */
export class LocalStorageAdapter extends BaseStorageService {
  private prefix: string;
  
  /**
   * Create a new LocalStorageAdapter
   * @param prefix Optional prefix for all keys to avoid collisions
   */
  constructor(prefix: string = 'model-card-app:') {
    super();
    this.prefix = prefix;
  }
  
  /**
   * Get an item from localStorage
   * @param key The key to get
   * @returns A promise that resolves to the item or null if not found
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  }
  
  /**
   * Set an item in localStorage
   * @param key The key to set
   * @param value The value to set
   * @returns A promise that resolves when the item is set
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      throw error;
    }
  }
  
  /**
   * Remove an item from localStorage
   * @param key The key to remove
   * @returns A promise that resolves when the item is removed
   */
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all items with the prefix from localStorage
   * @returns A promise that resolves when all items are cleared
   */
  async clear(): Promise<void> {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw error;
    }
  }
  
  /**
   * Get all keys with the prefix in localStorage
   * @returns A promise that resolves to an array of keys without the prefix
   */
  async keys(): Promise<string[]> {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
      return [];
    }
  }
}