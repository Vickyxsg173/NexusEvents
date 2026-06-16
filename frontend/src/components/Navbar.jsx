import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from './ThemeProvider';
import { Compass, Bookmark, User, LogOut, Home, Menu, X } from 'lucide-react';
import ThemeToggleSwitch from './ThemeToggleSwitch';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to resolve the effective theme out of system/dark/light
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
            <Link to="/" onClick={closeMobileMenu} className="flex-shrink-0 flex items-center font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
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

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl absolute w-full left-0 z-40 animate-fade-in-up">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={closeMobileMenu} className={`block ${navLinkClass('/')}`}>
              <Home className="w-4 h-4 mr-2" /> Home
            </Link>
            <Link to="/discover" onClick={closeMobileMenu} className={`block ${navLinkClass('/discover')}`}>
              <Compass className="w-4 h-4 mr-2" /> Discover
            </Link>
            {user && (
              <Link to="/saved" onClick={closeMobileMenu} className={`block ${navLinkClass('/saved')}`}>
                <Bookmark className="w-4 h-4 mr-2" /> Saved
              </Link>
            )}
          </div>
          
          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-5 mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggleSwitch 
                isDark={isDarkMode} 
                onToggle={(checked) => setTheme(checked ? 'dark' : 'light')} 
              />
            </div>
            
            {user ? (
              <div className="mt-3 px-2 space-y-1">
                <Link to="/profile" onClick={closeMobileMenu} className={`block ${navLinkClass('/profile')}`}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </Link>
                <button 
                  onClick={() => { signOut(); closeMobileMenu(); }}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-3 px-5 flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  onClick={closeMobileMenu}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={closeMobileMenu}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-brand-600 hover:bg-brand-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
