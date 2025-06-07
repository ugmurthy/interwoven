# Implementation Plan for FIXIT-mock-1.md Requirements

This document outlines the detailed implementation plan for the changes requested in FIXIT-mock-1.md.

## 1. Fix Light/Dark Theme

The current implementation has an issue with the light/dark theme toggle. The dark mode class is being applied to a div inside the Layout component instead of the html element directly.

### Changes Required:

```typescript
// app/components/ui/Layout.tsx
// Current implementation:
const toggleDarkMode = () => {
  setDarkMode(!darkMode);
  document.documentElement.classList.toggle('dark');
};

// The issue is in the return statement:
return (
  <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
    {/* ... */}
  </div>
);

// Fix:
// 1. Remove the dark class from the div
// 2. Use useEffect to apply dark mode to document.documentElement
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);

// And update the return statement:
return (
  <div className="min-h-screen flex flex-col">
    {/* ... */}
  </div>
);
```

## 2. Refactor Model Schema

Update the ModelCard interface to include a `systemPrompt` field of type String.

### Changes Required:

```typescript
// app/types/index.ts
export interface ModelCard {
  id: string;
  name: string;
  description: string;
  systemPrompt: string; // Add this field
  parameters: Parameter[];
  inputConnections: Connection[];
  outputConnections: Connection[];
  llmProvider: 'openrouter' | 'ollama';
  llmModel: string;
  capabilities: ModelCapabilities;
  mcpServers?: string[]; // IDs of connected MCP servers
  settings?: Record<string, any>; // Add this field for settings JSON object
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. Refactor Model Create/View/Edit

Update the ModelCardEditor component to include fields for system prompt, settings, and MCP server names.

### Changes Required:

```typescript
// app/pages/ModelCardEditor.tsx
// Update the mock data to include the new fields
const mockModelCard: ModelCard = {
  // ...existing fields
  systemPrompt: 'You are a helpful assistant that summarizes text.',
  settings: {
    temperature: 0.7,
    maxTokens: 1000,
  },
  // ...other fields
};

// Update the initial form state
const [formData, setFormData] = useState<Partial<ModelCard>>({
  // ...existing fields
  systemPrompt: '',
  settings: {},
  mcpServers: [],
  // ...other fields
});

// Add handlers for settings changes
const handleSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  try {
    const settings = JSON.parse(e.target.value);
    setFormData({ ...formData, settings });
  } catch (error) {
    // Invalid JSON, but we'll let the user continue typing
    console.warn('Invalid JSON in settings field');
  }
};

// Add UI elements for the new fields in the form
// After the description field:
<div className="mb-4">
  <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    System Prompt
  </label>
  <textarea
    id="systemPrompt"
    name="systemPrompt"
    value={formData.systemPrompt || ''}
    onChange={handleInputChange}
    rows={3}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
    placeholder="Enter system prompt for the LLM"
  />
</div>

// After the LLM Configuration section:
<div className="mb-6">
  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
    Settings
  </h2>
  
  <div className="mb-4">
    <label htmlFor="settings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Settings (JSON)
    </label>
    <textarea
      id="settings"
      name="settings"
      value={JSON.stringify(formData.settings || {}, null, 2)}
      onChange={handleSettingsChange}
      rows={5}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
      placeholder="{}"
    />
  </div>
</div>

// After the Settings section:
<div className="mb-6">
  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
    MCP Servers
  </h2>
  
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Connected MCP Servers
    </label>
    {/* This would be a multi-select component in a real implementation */}
    <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 text-gray-500 dark:text-gray-400">
      MCP Server selection would go here
    </div>
  </div>
</div>
```

## 4. Add Enable/Disable Icon to MCP Server View

Update the MCPServer interface and the MCPServerManager component to include an enable/disable toggle.

### Changes Required:

```typescript
// app/types/index.ts
export interface MCPServer {
  id: string;
  name: string;
  settings: Record<string, any>;
  enabled: boolean; // Add this field
  createdAt: Date;
  updatedAt: Date;
}

// app/services/mcp/MCPServerManager.ts
// Update the addServer method to include the enabled field
async addServer(server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<MCPServer> {
  const servers = await this.getServers();
  
  const newServer: MCPServer = {
    ...server,
    enabled: server.enabled ?? true, // Default to enabled if not specified
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await this.storageService.setItem(this.storageKey, [...servers, newServer]);
  
  return newServer;
}

// Add a method to toggle server enabled status
async toggleServerEnabled(id: string): Promise<MCPServer> {
  const servers = await this.getServers();
  const server = servers.find(s => s.id === id);
  
  if (!server) {
    throw new Error(`MCP server with ID ${id} not found`);
  }
  
  const updatedServer: MCPServer = {
    ...server,
    enabled: !server.enabled,
    updatedAt: new Date(),
  };
  
  await this.storageService.setItem(
    this.storageKey,
    servers.map(s => (s.id === id ? updatedServer : s))
  );
  
  return updatedServer;
}

// app/pages/MCPServerManager.tsx
// Add a handler for toggling server enabled status
const handleToggleEnabled = async (id: string) => {
  try {
    const updatedServer = await mcpClientService.toggleServerEnabled(id);
    setServers(servers.map(server => 
      server.id === id ? updatedServer : server
    ));
  } catch (error) {
    console.error('Failed to toggle server enabled status:', error);
  }
};

// Update the server list to include the toggle button
// In the server list item, add a new button:
<button
  onClick={() => handleToggleEnabled(server.id)}
  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
  aria-label={server.enabled ? "Disable server" : "Enable server"}
>
  <Power 
    size={18} 
    className={`${server.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`} 
  />
</button>
```

## 5. Update Home Page

Update the Home page to show an input component that can connect to a workflow or model card, and ensure the app renders output to the output component.

### Changes Required:

```typescript
// app/pages/Home.tsx
// Add imports for new components
import { Send, Link as LinkIcon } from 'lucide-react';

// Add state for input and output
const [input, setInput] = useState('');
const [output, setOutput] = useState('');
const [selectedTarget, setSelectedTarget] = useState<'workflow' | 'modelCard' | null>(null);
const [isProcessing, setIsProcessing] = useState(false);

// Add handler for input submission
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!input.trim() || !selectedTarget) return;
  
  setIsProcessing(true);
  
  // In a real implementation, this would call the appropriate service
  setTimeout(() => {
    setOutput(`Processed input: ${input}\nUsing: ${selectedTarget}`);
    setIsProcessing(false);
  }, 1500);
};

// Add UI components for input and output
// After the hero section and before the quick actions:
{/* Input/Output Section */}
<div className="mb-12 grid grid-cols-1 gap-6">
  {/* Input Component */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
      Input
    </h2>
    
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your input here..."
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Connect to:
        </label>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setSelectedTarget('modelCard')}
            className={`px-4 py-2 rounded-md flex items-center ${
              selectedTarget === 'modelCard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <PlusCircle size={18} className="mr-2" />
            Model Card
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedTarget('workflow')}
            className={`px-4 py-2 rounded-md flex items-center ${
              selectedTarget === 'workflow'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Workflow size={18} className="mr-2" />
            Workflow
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!input.trim() || !selectedTarget || isProcessing}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
            (!input.trim() || !selectedTarget || isProcessing) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Process'}
          <Send size={18} className="ml-2" />
        </button>
      </div>
    </form>
  </div>
  
  {/* Output Component */}
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
      Output
    </h2>
    
    {output ? (
      <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
        {output}
      </div>
    ) : (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Output will appear here after processing
      </div>
    )}
    
    {output && (
      <div className="mt-4 flex justify-end space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center"
        >
          <LinkIcon size={14} className="mr-1" />
          Copy
        </button>
        <button
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm"
        >
          Export
        </button>
      </div>
    )}
  </div>
</div>
```

## Summary of Changes

1. **Fix Light/Dark Theme**
   - Update Layout.tsx to properly apply dark mode to the html element

2. **Update Model Schema**
   - Add systemPrompt field to ModelCard interface
   - Add settings field to ModelCard interface

3. **Refactor Model Card Components**
   - Add system prompt field to ModelCardEditor
   - Add settings JSON editor to ModelCardEditor
   - Add MCP server selection to ModelCardEditor

4. **Enhance MCP Server Management**
   - Add enabled field to MCPServer interface
   - Add toggle functionality to MCPServerManager
   - Add UI toggle button for enabling/disabling servers

5. **Update Home Page**
   - Add input component with connection options
   - Add output component for displaying results
   - Implement basic processing flow

These changes will address all the requirements specified in FIXIT-mock-1.md.