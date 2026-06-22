import React, { useState, useEffect } from 'react';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function EventFilters({ filters, setFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const activeFiltersCount = Object.values(filters).filter(val => val !== '').length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-8 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-slate-900 dark:text-white font-semibold hover:text-brand-600 dark:hover:text-brand-400 transition-colors outline-none"
        >
          <Filter className="w-5 h-5 mr-2 text-brand-600" />
          Filter Events
          {activeFiltersCount > 0 && !isExpanded && (
            <span className="ml-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs py-0.5 px-2 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 ml-2 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />}
        </button>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm flex items-center text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">

      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input 
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={handleChange}
          placeholder="Search for events by keyword, name, or description..."
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block pl-10 p-3 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white transition-colors shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Source Platform Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Source</label>
          <select 
            name="source_platform" 
            value={filters.source_platform} 
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white transition-colors"
          >
            <option value="">All Sources</option>
            <option value="Unstop">Unstop</option>
            <option value="Devfolio">Devfolio</option>
            <option value="HackerEarth">HackerEarth</option>
            <option value="Major League Hacking (MLH)">MLH</option>
            <option value="Devpost">Devpost</option>
            <option value="Google Developer Groups (GDG)">Google Developer Groups</option>
            <option value="Microsoft Reactor">Microsoft Reactor</option>
            <option value="AWS Events">AWS Events</option>
            <option value="Meetup">Meetup</option>
            <option value="Hack2Skill">Hack2Skill</option>
            <option value="CNCF">Cloud Native Computing Foundation</option>
            <option value="Linux Foundation">Linux Foundation</option>
            <option value="Y Combinator">Y Combinator</option>
            <option value="GitHub Internships (Simplify)">GitHub Internships</option>
          </select>
        </div>

        {/* Mode Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Mode</label>
          <select 
            name="mode" 
            value={filters.mode} 
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white transition-colors"
          >
            <option value="">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Type</label>
          <select 
            name="event_type" 
            value={filters.event_type} 
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white transition-colors"
          >
            <option value="">All Types</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Conference">Conference</option>
            <option value="Competition">Competition</option>
            <option value="Workshop">Workshop</option>
            <option value="Webinar">Webinar</option>
            <option value="Internship/Job">Internship / Job</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Category</label>
          <select 
            name="category" 
            value={filters.category} 
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white transition-colors"
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
      )}
    </div>
  );
}
