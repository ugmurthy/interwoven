import React, { useState } from 'react';
import { Layout } from '../components/ui/Layout';
import { Save, Key, Database, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        
        {/* API Keys */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Key size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              API Keys
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="openrouter-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OpenRouter API Key
              </label>
              <input
                type="password"
                id="openrouter-api-key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your OpenRouter API key"
              />
            </div>
            
            <div>
              <label htmlFor="ollama-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ollama URL
              </label>
              <input
                type="text"
                id="ollama-url"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="http://localhost:11434"
                defaultValue="http://localhost:11434"
              />
            </div>
          </div>
        </div>
        
        {/* Storage Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Database size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Storage Settings
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="storage-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Storage Type
              </label>
              <select
                id="storage-type"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="localStorage">Local Storage (Browser)</option>
                <option value="indexedDB">IndexedDB (Browser)</option>
                <option value="localDB">Local Database (Future)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="storage-prefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Storage Prefix
              </label>
              <input
                type="text"
                id="storage-prefix"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="model-card-app:"
                defaultValue="model-card-app:"
              />
            </div>
          </div>
        </div>
        
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            {darkMode ? (
              <Moon size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
            ) : (
              <Sun size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Appearance
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dark-mode"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Dark Mode
              </label>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Save size={18} className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </Layout>
  );
}