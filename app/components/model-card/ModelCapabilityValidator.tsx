import React from 'react';
import { ModelCapabilities } from '../../types';

interface ModelCapabilityValidatorProps {
  capabilities: ModelCapabilities;
  onValidate: (isValid: boolean, errors: string[]) => void;
  children: React.ReactNode;
}

export function ModelCapabilityValidator({
  capabilities,
  onValidate,
  children,
}: ModelCapabilityValidatorProps) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isValid, setIsValid] = React.useState(true);

  // Validate capabilities when they change
  React.useEffect(() => {
    const validationErrors: string[] = [];

    // Check for required capabilities based on your application's needs
    // This is just an example - adjust based on your requirements
    if (capabilities.supportsTools && capabilities.supportedToolTypes.length === 0) {
      validationErrors.push('Tool support is enabled but no tool types are specified');
    }

    // Add more validation rules as needed
    // For example, check if the model actually supports the claimed capabilities
    // This would typically involve checking against a database of known model capabilities

    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
    onValidate(validationErrors.length === 0, validationErrors);
  }, [capabilities, onValidate]);

  return (
    <div>
      {errors.length > 0 && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          <h4 className="font-medium mb-1">Capability Validation Errors:</h4>
          <ul className="list-disc list-inside text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
}

// Helper function to check if a model supports specific capabilities
export function validateModelCapabilities(
  modelName: string,
  provider: 'openrouter' | 'ollama',
  requestedCapabilities: Partial<ModelCapabilities>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // This would typically be a lookup against a database of known model capabilities
  // For now, we'll use a simple hardcoded approach for demonstration
  
  // Example validation for OpenRouter models
  if (provider === 'openrouter') {
    if (modelName.includes('claude')) {
      // Claude models support
      if (requestedCapabilities.supportsImages && !modelName.includes('claude-3')) {
        errors.push('Only Claude 3 models support images');
      }
      
      if (requestedCapabilities.supportsAudio) {
        errors.push('Claude models do not support audio input');
      }
    } else if (modelName.includes('gpt-4')) {
      // GPT-4 models support
      if (requestedCapabilities.supportsAudio && !modelName.includes('vision')) {
        errors.push('Only GPT-4 Vision models support audio input');
      }
    }
  } 
  // Example validation for Ollama models
  else if (provider === 'ollama') {
    if (requestedCapabilities.supportsImages && !modelName.includes('llava')) {
      errors.push('Only Llava models in Ollama support images');
    }
    
    if (requestedCapabilities.supportsAudio) {
      errors.push('Ollama models do not currently support audio input');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}