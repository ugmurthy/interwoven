import { LocalStorageAdapter } from '../services/storage/LocalStorageAdapter';
import { ModelCardServiceImpl } from '../services/model-card/ModelCardService';
import { seedModelCards } from './seedData';

/**
 * Test script for the ModelCardService
 * This can be run to verify that the service is working correctly
 */
async function testModelCardService() {
  console.log('Testing ModelCardService...');
  
  // Initialize services
  const storageService = new LocalStorageAdapter();
  const modelCardService = new ModelCardServiceImpl(storageService);
  
  // Clear existing data for testing
  await storageService.removeItem('model-cards');
  console.log('Cleared existing model cards');
  
  // Seed model cards
  await seedModelCards(modelCardService);
  console.log('Seeded model cards');
  
  // Get all model cards
  const modelCards = await modelCardService.getModelCards();
  console.log(`Found ${modelCards.length} model cards:`);
  modelCards.forEach(card => {
    console.log(`- ${card.name} (${card.id})`);
  });
  
  // Get a specific model card
  if (modelCards.length > 0) {
    const firstCard = modelCards[0];
    const retrievedCard = await modelCardService.getModelCard(firstCard.id);
    console.log(`Retrieved card: ${retrievedCard?.name}`);
    
    // Update the model card
    if (retrievedCard) {
      const updatedCard = await modelCardService.updateModelCard(retrievedCard.id, {
        description: `${retrievedCard.description} (Updated)`,
      });
      console.log(`Updated card: ${updatedCard.description}`);
    }
    
    // Delete the model card
    await modelCardService.deleteModelCard(firstCard.id);
    console.log(`Deleted card: ${firstCard.name}`);
    
    // Verify deletion
    const remainingCards = await modelCardService.getModelCards();
    console.log(`Remaining cards: ${remainingCards.length}`);
  }
  
  console.log('ModelCardService test completed');
}

// Run the test
testModelCardService().catch(err => {
  console.error('Error testing ModelCardService:', err);
});