import React, { useEffect } from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';
import EventCard from '../components/EventCard';
import { Bookmark, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedEvents() {
  const { savedEvents, fetchSavedEvents, loading, error } = useBookmarkStore();

  useEffect(() => {
    fetchSavedEvents();
  }, [fetchSavedEvents]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-5">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bookmark className="w-8 h-8 mr-3 text-brand-500" fill="currentColor" />
          My Saved Events
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your personal collection of hackathons and tech events.
        </p>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-400">
          Error loading saved events: {error}
        </div>
      ) : savedEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Bookmark className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No saved events yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 mb-6">Explore the dashboard and click the bookmark icon to save events here.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
