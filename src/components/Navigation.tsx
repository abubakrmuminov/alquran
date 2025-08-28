import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  isDark, 
  onToggleTheme 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'bookmarks', label: 'Bookmarks' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Лого */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              Quran Reader
            </h1>
          </div>

          {/* Навигация */}
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>

          {/* Правый блок */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onToggleTheme}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => onPageChange('settings')}
              className="p-2 text-gray-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};