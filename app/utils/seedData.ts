import { ModelCard } from '../types';
import { ModelCardService } from '../services/model-card/ModelCardService';

/**
 * Seed the application with initial model cards if none exist
 * @param modelCardService The model card service to use
 * @param force If true, will seed even if model cards already exist
 */
export async function seedModelCards(modelCardService: ModelCardService, force: boolean = false): Promise<void> {
  // Check if we already have model cards
  const existingCards = await modelCardService.getModelCards();
  
  // If we already have model cards and force is false, don't seed
  if (existingCards.length > 0 && !force) {
    console.log('Model cards already exist, skipping seed');
    return;
  }
  
  // If force is true and we have existing cards, clear them first
  if (force && existingCards.length > 0) {
    console.log('Force seeding, clearing existing model cards...');
    for (const card of existingCards) {
      await modelCardService.deleteModelCard(card.id);
    }
  }
  
  console.log('Seeding model cards...');
  
  // Default model cards to seed
  const defaultModelCards: Omit<ModelCard, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Text Summarizer',
      description: 'Summarizes long text into concise paragraphs',
      systemPrompt: 'Summarize the following text:',
      parameters: [
        {
          id: 'param1',
          name: 'max_length',
          type: 'number',
          value: 100,
          description: 'Maximum length of the summary',
        },
      ],
      inputConnections: [],
      outputConnections: [],
      llmProvider: 'openrouter',
      llmModel: 'anthropic/claude-3-sonnet',
      capabilities: {
        supportsImages: false,
        supportsAudio: false,
        supportsFiles: true,
        supportsTools: false,
        supportedToolTypes: [],
      },
    },
    {
      name: 'Image Analyzer',
      description: 'Analyzes images and provides detailed descriptions',
      systemPrompt: 'Describe the following image in detail:',
      parameters: [
        {
          id: 'param1',
          name: 'detail_level',
          type: 'select',
          value: 'high',
          options: ['low', 'medium', 'high'],
          description: 'Level of detail in the description',
        },
      ],
      inputConnections: [],
      outputConnections: [],
      llmProvider: 'openrouter',
      llmModel: 'anthropic/claude-3-opus',
      capabilities: {
        supportsImages: true,
        supportsAudio: false,
        supportsFiles: false,
        supportsTools: false,
        supportedToolTypes: [],
      },
    },
    {
      name: 'Code Generator',
      description: 'Generates code based on natural language descriptions',
      systemPrompt: 'Generate code based on the following description:',
      parameters: [
        {
          id: 'param1',
          name: 'language',
          type: 'select',
          value: 'javascript',
          options: ['javascript', 'python', 'java', 'typescript', 'go', 'rust'],
          description: 'Programming language to generate',
        },
        {
          id: 'param2',
          name: 'include_comments',
          type: 'boolean',
          value: true,
          description: 'Whether to include comments in the generated code',
        },
      ],
      inputConnections: [],
      outputConnections: [],
      llmProvider: 'openrouter',
      llmModel: 'anthropic/claude-3-opus',
      capabilities: {
        supportsImages: false,
        supportsAudio: false,
        supportsFiles: true,
        supportsTools: true,
        supportedToolTypes: ['code-execution'],
      },
    },
  ];
  
  // Create each model card
  for (const modelCard of defaultModelCards) {
    await modelCardService.createModelCard(modelCard);
  }
  
  console.log('Model cards seeded successfully');
}