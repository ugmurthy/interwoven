import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export default function WorkflowEditor() {
  const [searchParams] = useSearchParams();
  const modelCardId = searchParams.get('modelCardId');
  
  // Placeholder for workflow editor
  // In a real implementation, this would include:
  // - Canvas for connecting model cards
  // - Drag and drop functionality
  // - Connection management
  // - Workflow execution
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Editor
          </h1>
          
          <div className="ml-auto flex space-x-2">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Save size={18} className="mr-2" />
              Save Workflow
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Workflow Details
            </h2>
          </div>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="My Workflow"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your workflow"
            />
          </div>
        </div>
        
        {/* Workflow Canvas Placeholder */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 mb-6 min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
            Workflow Editor Canvas
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            Drag and drop model cards to create a workflow
          </p>
          
          <button
            className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" />
            Add Model Card
          </button>
        </div>
        
        {/* Model Cards Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Available Model Cards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Text Summarizer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Summarizes long text into concise paragraphs</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Image Analyzer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyzes images and provides detailed descriptions</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}