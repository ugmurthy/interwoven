import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ModelCard as ModelCardComponent } from '../components/model-card/ModelCard';
import { ModelCard } from '../types';
import { Plus } from 'lucide-react';

// Mock data for demonstration
const mockModelCards: ModelCard[] = [
  {
    id: '1',
    name: 'Text Summarizer',
    description: 'Summarizes long text into concise paragraphs',
    parameters: [
      { id: '1', name: 'Length', type: 'number', value: 100 },
      { id: '2', name: 'Style', type: 'select', value: 'concise', options: ['concise', 'detailed', 'bullet-points'] },
    ],
    inputConnections: [],
    outputConnections: [],
    llmProvider: 'openrouter',
    llmModel: 'anthropic/claude-3-opus',
    capabilities: {
      supportsImages: true,
      supportsAudio: false,
      supportsFiles: true,
      supportsTools: true,
      supportedToolTypes: ['web-search', 'calculator'],
    },
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date('2025-05-15'),
  },
  {
    id: '2',
    name: 'Image Analyzer',
    description: 'Analyzes images and provides detailed descriptions',
    parameters: [
      { id: '1', name: 'Detail Level', type: 'select', value: 'high', options: ['low', 'medium', 'high'] },
      { id: '2', name: 'Include Objects', type: 'boolean', value: true },
    ],
    inputConnections: [],
    outputConnections: [],
    llmProvider: 'openrouter',
    llmModel: 'anthropic/claude-3-sonnet',
    capabilities: {
      supportsImages: true,
      supportsAudio: false,
      supportsFiles: false,
      supportsTools: false,
      supportedToolTypes: [],
    },
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-05-10'),
  },
];

export default function ModelCards() {
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  
  // Simulate loading model cards from storage
  useEffect(() => {
    // In a real implementation, this would fetch from a service
    setModelCards(mockModelCards);
  }, []);
  
  const handleEditModelCard = (id: string) => {
    // Navigate to edit page
    window.location.href = `/model-cards/${id}`;
  };
  
  const handleDeleteModelCard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this model card?')) {
      // In a real implementation, this would call a service
      setModelCards(modelCards.filter(card => card.id !== id));
    }
  };
  
  const handleConnectModelCard = (id: string) => {
    // Navigate to workflow editor
    window.location.href = `/workflows?modelCardId=${id}`;
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Model Cards
          </h1>
          
          <Link
            to="/model-cards/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" />
            Create Model Card
          </Link>
        </div>
        
        {modelCards.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              No Model Cards Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first model card to get started with building AI workflows.
            </p>
            <Link
              to="/model-cards/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" />
              Create Model Card
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {modelCards.map((modelCard) => (
              <ModelCardComponent
                key={modelCard.id}
                modelCard={modelCard}
                onEdit={handleEditModelCard}
                onDelete={handleDeleteModelCard}
                onConnect={handleConnectModelCard}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}