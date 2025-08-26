import React from 'react';
import { Home, Search, Bookmark, Settings, Moon, Sun } from 'lucide-react';
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              Quran Reader
            </h1>
          </div>
          
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
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for verses, words, or topics..."
                className="bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none w-80"
              />
            </div>
            
            <button className="p-2 text-gray-400 hover:text-white">
              <Bookmark className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onToggleTheme}
              className="p-2 text-gray-400 hover:text-white"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="text-gray-400 text-sm">EN</div>
            
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