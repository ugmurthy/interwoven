import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ModelCard as ModelCardComponent } from '../components/model-card/ModelCard';
import { Plus, RefreshCw } from 'lucide-react';
import { useModelCard } from '../context/ModelCardContext';
import { seedModelCards } from '../utils/seedData';
import { ModelCardServiceImpl } from '../services/model-card/ModelCardService';
import { LocalStorageAdapter } from '../services/storage/LocalStorageAdapter';

export default function ModelCards() {
  const { modelCards, isLoading, error, deleteModelCard, refreshModelCards } = useModelCard();
  const navigate = useNavigate();
  const [isReseeding, setIsReseeding] = useState(false);
  
  // Function to reset model cards (for testing purposes)
  const handleResetModelCards = async () => {
    if (!window.confirm('Are you sure you want to reset all model cards? This will delete all existing cards and create new ones.')) {
      return;
    }
    
    setIsReseeding(true);
    try {
      const storageService = new LocalStorageAdapter();
      const modelCardService = new ModelCardServiceImpl(storageService);
      
      // Force seed the model cards (this will clear existing ones)
      await seedModelCards(modelCardService, true);
      
      // Refresh the model cards list
      await refreshModelCards();
      
      alert('Model cards have been reset successfully.');
    } catch (error) {
      console.error('Error resetting model cards:', error);
      alert('Failed to reset model cards.');
    } finally {
      setIsReseeding(false);
    }
  };
  
  const handleEditModelCard = (id: string) => {
    // Navigate to edit page using the navigate function
    navigate(`/model-cards/${id}`);
  };
  
  const handleDeleteModelCard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this model card?')) {
      deleteModelCard(id).catch(err => {
        console.error('Error deleting model card:', err);
        alert('Failed to delete model card');
      });
    }
  };
  
  const handleConnectModelCard = (id: string) => {
    // Navigate to workflow editor
    navigate(`/workflows?modelCardId=${id}`);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Model Cards
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={handleResetModelCards}
              disabled={isReseeding}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              title="Reset model cards (for testing)"
            >
              <RefreshCw size={18} className={`mr-2 ${isReseeding ? 'animate-spin' : ''}`} />
              Reset Cards
            </button>
            
            <button
              onClick={() => navigate('/model-cards/new')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" />
              Create Model Card
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading model cards...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : modelCards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              No Model Cards Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first model card to get started with building AI workflows.
            </p>
            <button
              onClick={() => navigate('/model-cards/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" />
              Create Model Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {modelCards.map((modelCard) => (
              <ModelCardComponent
                key={modelCard.id}
                modelCard={modelCard}
                onEdit={() => handleEditModelCard(modelCard.id)}
                onDelete={() => handleDeleteModelCard(modelCard.id)}
                onRun={() => handleConnectModelCard(modelCard.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}