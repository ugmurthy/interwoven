import React, { useState } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { PlusCircle, Workflow, Server, Settings, Send, Link as LinkIcon } from 'lucide-react';

export default function Home() {
  // State for input and output
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'workflow' | 'modelCard' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle input submission
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
  
  // Quick action cards
  const quickActions = [
    {
      title: 'Create Model Card',
      description: 'Create a new model card with custom parameters',
      icon: <PlusCircle size={24} className="text-blue-600 dark:text-blue-400" />,
      link: '/model-cards/new',
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Manage Workflows',
      description: 'Create and manage model card workflows',
      icon: <Workflow size={24} className="text-purple-600 dark:text-purple-400" />,
      link: '/workflows',
      color: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'MCP Servers',
      description: 'Configure and manage MCP servers',
      icon: <Server size={24} className="text-green-600 dark:text-green-400" />,
      link: '/mcp-servers',
      color: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      icon: <Settings size={24} className="text-gray-600 dark:text-gray-400" />,
      link: '/settings',
      color: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Model Card Application
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create, connect, and manage model cards to build powerful AI workflows
          </p>
        </div>

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
        
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`${action.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start space-x-4`}
              >
                <div className="flex-shrink-0">{action.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Getting Started
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">Create a Model Card</span> - Define parameters and
              capabilities for your AI model
            </li>
            <li>
              <span className="font-medium">Configure Inputs</span> - Set up text, file, or audio
              inputs for your model
            </li>
            <li>
              <span className="font-medium">Connect to MCP Servers</span> - Add tool capabilities
              with MCP servers
            </li>
            <li>
              <span className="font-medium">Create Workflows</span> - Connect multiple model cards
              for complex pipelines
            </li>
          </ol>
          <div className="mt-6">
            <Link
              to="/model-cards/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Model Card
              <PlusCircle size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}