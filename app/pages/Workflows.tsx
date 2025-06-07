import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { useWorkflow } from '../context/WorkflowContext';
import { Plus, Edit, Trash2, Play } from 'lucide-react';

export default function Workflows() {
  // State to track if we're in the browser
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Initialize on mount (client-side only)
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // During server-side rendering, render a simplified version
  if (!isBrowser) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Workflows
          </h1>
          <p>Loading workflows...</p>
        </div>
      </Layout>
    );
  }
  
  // Once we're in the browser, render the full component
  return <WorkflowsContent />;
}

// Separate component that uses hooks
function WorkflowsContent() {
  const navigate = useNavigate();
  const { workflows, deleteWorkflow } = useWorkflow();
  const [error, setError] = useState<string | null>(null);
  
  // Handle create workflow
  const handleCreateWorkflow = () => {
    try {
      console.log('Creating new workflow');
      navigate('/workflows/new');
    } catch (error) {
      console.error('Error navigating to workflow editor:', error);
      setError(`Error navigating to workflow editor: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle edit workflow
  const handleEditWorkflow = (id: string) => {
    try {
      console.log(`Editing workflow: ${id}`);
      navigate(`/workflows/${id}`);
    } catch (error) {
      console.error(`Error navigating to workflow editor for ${id}:`, error);
      setError(`Error navigating to workflow editor: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle delete workflow
  const handleDeleteWorkflow = (id: string) => {
    try {
      if (!confirm('Are you sure you want to delete this workflow?')) return;
      
      console.log(`Deleting workflow: ${id}`);
      deleteWorkflow(id);
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      setError(`Error deleting workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle execute workflow
  const handleExecuteWorkflow = (id: string) => {
    try {
      console.log(`Executing workflow: ${id}`);
      navigate(`/workflows/${id}`);
    } catch (error) {
      console.error(`Error navigating to execute workflow ${id}:`, error);
      setError(`Error navigating to execute workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    try {
      return new Date(date).toLocaleString();
    } catch (error) {
      console.error(`Error formatting date ${date}:`, error);
      return 'Invalid date';
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workflows
          </h1>
          
          <button
            onClick={handleCreateWorkflow}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={18} className="mr-2" />
            Create Workflow
          </button>
        </div>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Workflows list */}
        {workflows.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-750">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Model Cards
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Connections
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(workflow.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.modelCards?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {workflow.connections?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditWorkflow(workflow.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Execute"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No workflows found. Create your first workflow to get started.
            </p>
            <button
              onClick={handleCreateWorkflow}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={18} className="mr-2" />
              Create Workflow
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}