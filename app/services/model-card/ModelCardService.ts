import { ModelCard } from '../../types';
import { StorageService } from '../storage/StorageService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Model Card Service Interface
 * Provides functionality for managing model cards
 */
export interface ModelCardService {
  /**
   * Get all model cards
   * @returns A promise that resolves to an array of model cards
   */
  getModelCards(): Promise<ModelCard[]>;
  
  /**
   * Get a model card by ID
   * @param id The ID of the model card
   * @returns A promise that resolves to the model card or null if not found
   */
  getModelCard(id: string): Promise<ModelCard | null>;
  
  /**
   * Create a new model card
   * @param modelCard The model card to create
   * @returns A promise that resolves to the created model card
   */
  createModelCard(modelCard: Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelCard>;
  
  /**
   * Update an existing model card
   * @param id The ID of the model card to update
   * @param modelCard The updated model card data
   * @returns A promise that resolves to the updated model card
   */
  updateModelCard(id: string, modelCard: Partial<Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ModelCard>;
  
  /**
   * Delete a model card
   * @param id The ID of the model card to delete
   * @returns A promise that resolves when the model card is deleted
   */
  deleteModelCard(id: string): Promise<void>;
}

/**
 * Model Card Service Implementation
 * Uses local storage to persist model cards
 */
export class ModelCardServiceImpl implements ModelCardService {
  private storageService: StorageService;
  private storageKey: string = 'model-cards';
  
  /**
   * Create a new ModelCardServiceImpl
   * @param storageService The storage service to use
   */
  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }
  
  /**
   * Get all model cards
   * @returns A promise that resolves to an array of model cards
   */
  async getModelCards(): Promise<ModelCard[]> {
    const modelCards = await this.storageService.getItem<ModelCard[]>(this.storageKey);
    return modelCards || [];
  }
  
  /**
   * Get a model card by ID
   * @param id The ID of the model card
   * @returns A promise that resolves to the model card or null if not found
   */
  async getModelCard(id: string): Promise<ModelCard | null> {
    const modelCards = await this.getModelCards();
    return modelCards.find(modelCard => modelCard.id === id) || null;
  }
  
  /**
   * Create a new model card
   * @param modelCard The model card to create
   * @returns A promise that resolves to the created model card
   */
  async createModelCard(modelCard: Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelCard> {
    const modelCards = await this.getModelCards();
    
    const newModelCard: ModelCard = {
      ...modelCard,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(this.storageKey, [...modelCards, newModelCard]);
    
    return newModelCard;
  }
  
  /**
   * Update an existing model card
   * @param id The ID of the model card to update
   * @param modelCard The updated model card data
   * @returns A promise that resolves to the updated model card
   */
  async updateModelCard(id: string, modelCard: Partial<Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ModelCard> {
    const modelCards = await this.getModelCards();
    const existingModelCard = modelCards.find(mc => mc.id === id);
    
    if (!existingModelCard) {
      throw new Error(`Model card with ID ${id} not found`);
    }
    
    const updatedModelCard: ModelCard = {
      ...existingModelCard,
      ...modelCard,
      updatedAt: new Date(),
    };
    
    await this.storageService.setItem(
      this.storageKey,
      modelCards.map(mc => (mc.id === id ? updatedModelCard : mc))
    );
    
    return updatedModelCard;
  }
  
  /**
   * Delete a model card
   * @param id The ID of the model card to delete
   * @returns A promise that resolves when the model card is deleted
   */
  async deleteModelCard(id: string): Promise<void> {
    const modelCards = await this.getModelCards();
    
    await this.storageService.setItem(
      this.storageKey,
      modelCards.filter(modelCard => modelCard.id !== id)
    );
  }
}