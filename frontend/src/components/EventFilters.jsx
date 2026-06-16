import React from 'react';
import { Filter, X, Search } from 'lucide-react';

export default function EventFilters({ filters, setFilters }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      source_platform: '',
      mode: '',
      event_type: '',
      category: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-900 dark:text-white font-semibold">
          <Filter className="w-5 h-5 mr-2 text-brand-600" />
          Filter Events
        </div>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm flex items-center text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search for events by keyword, name, or description..."
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block pl-10 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Source Platform Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Source</label>
          <select 
            name="source_platform" 
            value={filters.source_platform} 
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors"
          >
            <option value="">All Sources</option>
            <option value="Unstop">Unstop</option>
            <option value="Devfolio">Devfolio</option>
            <option value="Hack2Skill">Hack2Skill</option>
          </select>
        </div>

        {/* Mode Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Mode</label>
          <select 
            name="mode" 
            value={filters.mode} 
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors"
          >
            <option value="">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Type</label>
          <select 
            name="event_type" 
            value={filters.event_type} 
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors"
          >
            <option value="">All Types</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Conference">Conference</option>
            <option value="Competition">Competition</option>
            <option value="Workshop">Workshop</option>
            <option value="Webinar">Webinar</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Category</label>
          <select 
            name="category" 
            value={filters.category} 
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors"
          >
            <option value="">All Categories</option>
            <option value="AI/ML">AI / ML</option>
            <option value="Web Development">Web Development</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Open Source">Open Source</option>
            <option value="General">General Tech</option>
          </select>
        </div>

      </div>
    </div>
  );
}
