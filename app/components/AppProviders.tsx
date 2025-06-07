import React, { ReactNode, useState, useEffect } from 'react';
import { WorkflowProvider } from '../context/WorkflowContext';
import { MCPProvider } from '../context/MCPContext';
import { SecretProvider } from '../context/SecretContext';
import { ModelCardProvider } from '../context/ModelCardContext';
import { StorageService } from '../services/storage/StorageService';
import { LocalStorageAdapter } from '../services/storage/LocalStorageAdapter';
import { MCPServerManager } from '../services/mcp/MCPServerManager';
import { SecretServiceImpl } from '../services/secret/SecretServiceImpl';
import { ModelCardServiceImpl } from '../services/model-card/ModelCardService';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Initialize services only on the client side
  const [services, setServices] = useState<{
    storageService: StorageService | null;
    mcpClientService: MCPServerManager | null;
    secretService: SecretServiceImpl | null;
    modelCardService: ModelCardServiceImpl | null;
  }>({
    storageService: null,
    mcpClientService: null,
    secretService: null,
    modelCardService: null,
  });
  
  // Initialize services on mount (client-side only)
  useEffect(() => {
    const storageService = new LocalStorageAdapter();
    const mcpClientService = new MCPServerManager(storageService);
    const secretService = new SecretServiceImpl(storageService);
    const modelCardService = new ModelCardServiceImpl(storageService);
    
    setServices({
      storageService,
      mcpClientService,
      secretService,
      modelCardService,
    });
    
    setIsBrowser(true);
  }, []);
  
  // During server-side rendering, just render children without providers
  if (!isBrowser) {
    return <>{children}</>;
  }
  
  // Once we're in the browser and services are initialized, wrap with providers
  if (services.storageService && services.mcpClientService && services.secretService && services.modelCardService) {
    return (
      <SecretProvider secretService={services.secretService}>
        <MCPProvider mcpClientService={services.mcpClientService}>
          <ModelCardProvider modelCardService={services.modelCardService}>
            <WorkflowProvider storageService={services.storageService}>
              {children}
            </WorkflowProvider>
          </ModelCardProvider>
        </MCPProvider>
      </SecretProvider>
    );
  }
  
  // Fallback while services are initializing
  return <>{children}</>;
}