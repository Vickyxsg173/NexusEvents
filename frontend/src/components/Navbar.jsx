import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from './ThemeProvider';
import { Compass, Bookmark, User, LogOut, Home } from 'lucide-react';
import ThemeToggleSwitch from './ThemeToggleSwitch';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Helper to resolve the effective theme out of system/dark/light
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all
    ${isActive(path) 
      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
  `;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Left Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
              NexusEvents
            </Link>
            
            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className={navLinkClass('/')}>
                <Home className="w-4 h-4 mr-2" /> Home
              </Link>
              <Link to="/discover" className={navLinkClass('/discover')}>
                <Compass className="w-4 h-4 mr-2" /> Discover
              </Link>
              {user && (
                <Link to="/saved" className={navLinkClass('/saved')}>
                  <Bookmark className="w-4 h-4 mr-2" /> Saved
                </Link>
              )}
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* Custom Animated Theme Toggle */}
            <ThemeToggleSwitch 
              isDark={isDarkMode} 
              onToggle={(checked) => setTheme(checked ? 'dark' : 'light')} 
            />

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className={navLinkClass('/profile')}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Mobile Navigation (Basic) */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 border-t border-gray-100 dark:border-gray-800 space-x-2 bg-white dark:bg-gray-900">
        <Link to="/" className={navLinkClass('/')}>Home</Link>
        <Link to="/discover" className={navLinkClass('/discover')}>Discover</Link>
        {user && <Link to="/saved" className={navLinkClass('/saved')}>Saved</Link>}
        {user && <Link to="/profile" className={navLinkClass('/profile')}>Profile</Link>}
      </div>
    </nav>
  );
}
