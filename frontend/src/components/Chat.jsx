import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Calendar, MapPin, ExternalLink } from 'lucide-react';

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  const inputRef = useRef(null);
  let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (API_URL.endsWith('/api/events')) {
    API_URL = API_URL.replace('/api/events', '');
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      const response = await fetch(`${API_URL}/api/chatbot/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      setResults(data.events || []);
      setShowResults(true);
      setIsOpen(false); // Close the input bubble, open the side panel
      
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* Overlay Panel for Results */}
      <AnimatePresence>
        {showResults && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowResults(false)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-[101] shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Recommendations</h3>
                </div>
                <button 
                  onClick={() => setShowResults(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {results.length > 0 ? (
                  results.map((event, i) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-colors relative group"
                    >
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 pr-8">{event.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{event.description}</p>
                      
                      <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-300 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" />
                          {event.venue || 'Online'}
                        </div>
                      </div>
                      
                      <a href={event.link || '#'} target="_blank" rel="noopener noreferrer" className="absolute top-5 right-5 p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-brand-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Bot className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">I couldn't find any events matching that query.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Chat Button / Input */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <AnimatePresence mode="wait">
          {!isOpen && !showResults && (
            <motion.button
              key="chat-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-brand-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center relative overflow-hidden group"
            >
              {/* Animated Glowing Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md animate-spin-slow"></div>
              <Sparkles className="w-8 h-8 text-white relative z-10 animate-pulse" />
            </motion.button>
          )}

          {isOpen && (
            <motion.div
              key="chat-input"
              initial={{ width: 64, height: 64, borderRadius: 32, opacity: 0 }}
              animate={{ width: 350, height: 64, borderRadius: 32, opacity: 1 }}
              exit={{ width: 64, height: 64, borderRadius: 32, opacity: 0 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl relative flex items-center overflow-hidden group pr-2"
            >
              {/* Animated Listening Edge Glow */}
              <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-1000 ${isSearching ? 'animate-pulse opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-1000 ${isSearching ? 'animate-pulse opacity-100' : 'opacity-0'}`}></div>
              </div>

              <form onSubmit={handleSearch} className="flex w-full items-center pl-2 relative z-10 h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 ml-1">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={isSearching ? "Searching vector DB..." : "Ask me anything..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching}
                  className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-0 px-4 text-sm disabled:opacity-50 min-w-0"
                />
                
                {/* Search / Cancel Buttons */}
                <div className="flex items-center space-x-1">
                  {!isSearching && (
                    <button 
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={!query.trim() || isSearching}
                    className={`p-2 rounded-full flex-shrink-0 transition-colors ${query.trim() && !isSearching ? 'text-brand-600 dark:text-cyan-400 hover:bg-brand-50 dark:hover:bg-cyan-900/30' : 'text-slate-400'}`}
                  >
                    {isSearching ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
