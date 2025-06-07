import React, { useState, useEffect } from 'react';
import { useSecret } from '../../context/SecretContext';
import { Secret } from '../../services/secret/SecretService';
import { Eye, EyeOff, Plus, Trash2, Edit, Save, X } from 'lucide-react';

export function SecretManager() {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Initialize on mount (client-side only)
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // During server-side rendering, render a simplified version
  if (!isBrowser) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            API Keys & Secrets
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading secrets...</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Environment Variables
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading environment variables...</p>
        </div>
      </div>
    );
  }
  
  // Once we're in the browser, render the full component
  return <SecretManagerContent />;
}

// Separate component that uses hooks
function SecretManagerContent() {
  const { 
    secrets, 
    environmentVariables,
    isLoading,
    error,
    addSecret,
    updateSecret,
    removeSecret,
    setEnvironmentVariable,
    removeEnvironmentVariable
  } = useSecret();

  const [showSecrets, setShowSecrets] = useState(false);
  const [isAddingSecret, setIsAddingSecret] = useState(false);
  const [isAddingEnvVar, setIsAddingEnvVar] = useState(false);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);
  
  // Form states
  const [secretName, setSecretName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [secretType, setSecretType] = useState<Secret['type']>('api_key');
  const [secretDescription, setSecretDescription] = useState('');
  
  const [envVarName, setEnvVarName] = useState('');
  const [envVarValue, setEnvVarValue] = useState('');

  // Reset form
  const resetSecretForm = () => {
    setSecretName('');
    setSecretValue('');
    setSecretType('api_key');
    setSecretDescription('');
  };

  const resetEnvVarForm = () => {
    setEnvVarName('');
    setEnvVarValue('');
  };

  // Handle add secret
  const handleAddSecret = async () => {
    if (!secretName || !secretValue) return;
    
    try {
      await addSecret({
        name: secretName,
        value: secretValue,
        type: secretType,
        description: secretDescription || undefined,
      });
      
      resetSecretForm();
      setIsAddingSecret(false);
    } catch (error) {
      console.error('Error adding secret:', error);
      alert('Failed to add secret');
    }
  };

  // Handle update secret
  const handleUpdateSecret = async () => {
    if (!editingSecretId || !secretName || !secretValue) return;
    
    try {
      await updateSecret(editingSecretId, {
        name: secretName,
        value: secretValue,
        type: secretType,
        description: secretDescription || undefined,
      });
      
      resetSecretForm();
      setEditingSecretId(null);
    } catch (error) {
      console.error('Error updating secret:', error);
      alert('Failed to update secret');
    }
  };

  // Handle remove secret
  const handleRemoveSecret = async (id: string) => {
    if (!confirm('Are you sure you want to remove this secret?')) return;
    
    try {
      await removeSecret(id);
      
      if (editingSecretId === id) {
        resetSecretForm();
        setEditingSecretId(null);
      }
    } catch (error) {
      console.error('Error removing secret:', error);
      alert('Failed to remove secret');
    }
  };

  // Handle edit secret
  const handleEditSecret = (secret: Secret) => {
    setSecretName(secret.name);
    setSecretValue(secret.value);
    setSecretType(secret.type);
    setSecretDescription(secret.description || '');
    setEditingSecretId(secret.id);
  };

  // Handle add environment variable
  const handleAddEnvVar = async () => {
    if (!envVarName || !envVarValue) return;
    
    try {
      await setEnvironmentVariable(envVarName, envVarValue);
      
      resetEnvVarForm();
      setIsAddingEnvVar(false);
    } catch (error) {
      console.error('Error adding environment variable:', error);
      alert('Failed to add environment variable');
    }
  };

  // Handle remove environment variable
  const handleRemoveEnvVar = async (name: string) => {
    if (!confirm('Are you sure you want to remove this environment variable?')) return;
    
    try {
      await removeEnvironmentVariable(name);
    } catch (error) {
      console.error('Error removing environment variable:', error);
      alert('Failed to remove environment variable');
    }
  };

  // Mask value for display
  const maskValue = (value: string) => {
    if (!value) return '';
    if (value.length <= 4) return '••••';
    return value.substring(0, 2) + '•'.repeat(value.length - 4) + value.substring(value.length - 2);
  };

  return (
    <div className="space-y-8">
      {/* Secrets Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            API Keys & Secrets
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              title={showSecrets ? 'Hide secrets' : 'Show secrets'}
            >
              {showSecrets ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={() => {
                resetSecretForm();
                setIsAddingSecret(true);
                setEditingSecretId(null);
              }}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              title="Add secret"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Add/Edit Secret Form */}
        {(isAddingSecret || editingSecretId) && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              {editingSecretId ? 'Edit Secret' : 'Add Secret'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={secretName}
                  onChange={(e) => setSecretName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="API_KEY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={secretValue}
                  onChange={(e) => setSecretValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Secret value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={secretType}
                  onChange={(e) => setSecretType(e.target.value as Secret['type'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="api_key">API Key</option>
                  <option value="token">Token</option>
                  <option value="password">Password</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={secretDescription}
                  onChange={(e) => setSecretDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Description"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    resetSecretForm();
                    setIsAddingSecret(false);
                    setEditingSecretId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={editingSecretId ? handleUpdateSecret : handleAddSecret}
                  disabled={!secretName || !secretValue}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    (!secretName || !secretValue) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {editingSecretId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secrets List */}
        {secrets.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {secrets.map((secret) => (
              <li key={secret.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {secret.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {secret.description || 'No description'}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                        {showSecrets ? secret.value : maskValue(secret.value)}
                      </span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {secret.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSecret(secret)}
                      className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveSecret(secret.id)}
                      className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No secrets added yet. Click the + button to add a secret.
          </div>
        )}
      </div>

      {/* Environment Variables Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Environment Variables
          </h2>
          <button
            onClick={() => {
              resetEnvVarForm();
              setIsAddingEnvVar(true);
            }}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            title="Add environment variable"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Add Environment Variable Form */}
        {isAddingEnvVar && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              Add Environment Variable
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={envVarName}
                  onChange={(e) => setEnvVarName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ENV_VAR_NAME"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={envVarValue}
                  onChange={(e) => setEnvVarValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Value"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    resetEnvVarForm();
                    setIsAddingEnvVar(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEnvVar}
                  disabled={!envVarName || !envVarValue}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    (!envVarName || !envVarValue) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Environment Variables List */}
        {Object.keys(environmentVariables).length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(environmentVariables).map(([name, value]) => (
              <li key={name} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{value}</span>
                </div>
                <button
                  onClick={() => handleRemoveEnvVar(name)}
                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No environment variables added yet. Click the + button to add one.
          </div>
        )}
      </div>
    </div>
  );
}