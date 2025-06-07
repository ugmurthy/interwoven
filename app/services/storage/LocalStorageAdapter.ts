import { BaseStorageService } from './StorageService';

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  try {
    // Check if window is defined (not in server-side rendering)
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if localStorage is available
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * LocalStorage Adapter
 * Implements the storage service interface using browser's localStorage
 * Falls back to in-memory storage when localStorage is not available (e.g., during SSR)
 */
export class LocalStorageAdapter extends BaseStorageService {
  private prefix: string;
  private memoryStorage: Map<string, string>;
  private isLocalStorageAvailable: boolean;
  
  /**
   * Create a new LocalStorageAdapter
   * @param prefix Optional prefix for all keys to avoid collisions
   */
  constructor(prefix: string = 'model-card-app:') {
    super();
    this.prefix = prefix;
    this.memoryStorage = new Map();
    this.isLocalStorageAvailable = isLocalStorageAvailable();
  }
  
  /**
   * Get an item from storage
   * @param key The key to get
   * @returns A promise that resolves to the item or null if not found
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      if (this.isLocalStorageAvailable) {
        const item = localStorage.getItem(this.prefix + key);
        if (item === null) {
          return null;
        }
        return JSON.parse(item) as T;
      } else {
        // Fall back to memory storage
        const item = this.memoryStorage.get(this.prefix + key);
        if (item === undefined) {
          return null;
        }
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  }
  
  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to set
   * @returns A promise that resolves when the item is set
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(this.prefix + key, serializedValue);
      } else {
        // Fall back to memory storage
        this.memoryStorage.set(this.prefix + key, serializedValue);
      }
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      throw error;
    }
  }
  
  /**
   * Remove an item from storage
   * @param key The key to remove
   * @returns A promise that resolves when the item is removed
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(this.prefix + key);
      } else {
        // Fall back to memory storage
        this.memoryStorage.delete(this.prefix + key);
      }
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all items with the prefix from storage
   * @returns A promise that resolves when all items are cleared
   */
  async clear(): Promise<void> {
    try {
      if (this.isLocalStorageAvailable) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } else {
        // Fall back to memory storage
        for (const key of this.memoryStorage.keys()) {
          if (key.startsWith(this.prefix)) {
            this.memoryStorage.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
  
  /**
   * Get all keys with the prefix in storage
   * @returns A promise that resolves to an array of keys without the prefix
   */
  async keys(): Promise<string[]> {
    try {
      if (this.isLocalStorageAvailable) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        }
        return keys;
      } else {
        // Fall back to memory storage
        const keys = [];
        for (const key of this.memoryStorage.keys()) {
          if (key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        }
        return keys;
      }
    } catch (error) {
      console.error('Error getting keys from storage:', error);
      return [];
    }
  }
}