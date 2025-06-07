import React, { useState } from 'react';
import { UsageStatistics as UsageStatsType } from '../../types';
import { BarChart2, PieChart as PieChartIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface UsageStatisticsProps {
  statistics: UsageStatsType;
  className?: string;
}

export function UsageStatistics({ statistics, className = '' }: UsageStatisticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Format time in a human-readable way
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Calculate percentages for the token distribution
  const promptPercentage = Math.round((statistics.promptTokens / statistics.totalTokens) * 100) || 0;
  const completionPercentage = Math.round((statistics.completionTokens / statistics.totalTokens) * 100) || 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div 
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Usage Statistics
        </h3>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </div>

      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
        <div className="p-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</div>
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {statistics.totalTokens}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Execution Time</div>
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {formatTime(statistics.executionTime)}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Tool Calls</div>
              <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {statistics.toolCalls}
              </div>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex justify-end mb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 flex">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1 rounded-md flex items-center text-sm ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <BarChart2 size={16} className="mr-1" />
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-1 rounded-md flex items-center text-sm ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <PieChartIcon size={16} className="mr-1" />
                Pie
              </button>
            </div>
          </div>

          {/* Token Usage Visualization */}
          <div className="h-64 mb-6">
            {chartType === 'bar' ? (
              <div className="h-full flex items-end">
                <div className="flex-1 flex items-end space-x-4 h-full">
                  <div className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-20" 
                      style={{ height: `${(statistics.promptTokens / statistics.totalTokens) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Prompt</div>
                    <div className="text-sm font-medium">{statistics.promptTokens}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div 
                      className="bg-green-500 w-20" 
                      style={{ height: `${(statistics.completionTokens / statistics.totalTokens) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Completion</div>
                    <div className="text-sm font-medium">{statistics.completionTokens}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="relative w-40 h-40">
                  {/* Pie chart using CSS conic gradient */}
                  <div 
                    className="w-full h-full rounded-full"
                    style={{ 
                      background: `conic-gradient(
                        #3B82F6 0% ${promptPercentage}%, 
                        #10B981 ${promptPercentage}% 100%
                      )` 
                    }}
                  ></div>
                  <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {statistics.totalTokens}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Prompt: </span>
                      <span className="font-medium">{promptPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Completion: </span>
                      <span className="font-medium">{completionPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Prompt Tokens:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {statistics.promptTokens}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Completion Tokens:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {statistics.completionTokens}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Total Tokens:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {statistics.totalTokens}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Execution Time:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatTime(statistics.executionTime)}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Tool Calls:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {statistics.toolCalls}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Tokens per Second:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {statistics.executionTime > 0
                  ? Math.round((statistics.totalTokens / statistics.executionTime) * 1000)
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}