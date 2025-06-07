import React from 'react';
import { Link, useLocation } from 'react-router';

export function Navigation() {
  const location = useLocation();
  
  // Navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/model-cards', label: 'Model Cards' },
    { path: '/workflows', label: 'Workflows' },
    { path: '/mcp-servers', label: 'MCP Servers' },
    { path: '/settings', label: 'Settings' },
  ];
  
  return (
    <nav className="flex flex-col md:flex-row md:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`py-2 px-1 border-b-2 md:border-b-0 md:border-l-2 ${
            location.pathname === item.path
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}