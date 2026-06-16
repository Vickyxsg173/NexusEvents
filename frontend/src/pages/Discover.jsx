import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useEventStore } from '../store/eventStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import InterestOnboarding from '../components/InterestOnboarding';
import EventCard from '../components/EventCard';
import EventCardSkeleton from '../components/EventCardSkeleton';
import EventFilters from '../components/EventFilters';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Discover() {
  const { user } = useAuthStore();
  const { userInterests, fetchUserInterests, loading: profileLoading } = useProfileStore();
  const { events, fetchEvents, loading: eventsLoading, error, hasMore } = useEventStore();
  const { fetchSavedEvents } = useBookmarkStore();
  
  const [filters, setFilters] = useState({
    source_platform: '',
    mode: '',
    event_type: '',
    category: '',
    search: ''
  });
  
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchUserInterests();
    fetchSavedEvents();
  }, [fetchUserInterests, fetchSavedEvents]);

  // Initial fetch and fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchEvents(filters, 1);
  }, [fetchEvents, filters]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchEvents(filters, nextPage);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const needsOnboarding = !profileLoading && userInterests.length === 0;

  // Calculate match scores for events based on userInterests
  const scoredEvents = React.useMemo(() => {
    if (!events || !userInterests || userInterests.length === 0) return events;
    
    const interestKeywords = userInterests
      .filter(i => typeof i === 'string' && i.trim() !== '')
      .map(i => i.toLowerCase());
      
    if (interestKeywords.length === 0) return events;
    
    return events.map(event => {
      let score = 0;
      const title = (event.title || '').toLowerCase();
      const desc = (event.description || '').toLowerCase();
      const tags = (event.tags || []).map(t => typeof t === 'string' ? t.toLowerCase() : '');
      
      interestKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3;
        if (tags.some(t => t.includes(keyword) || keyword.includes(t))) score += 2;
        if (desc.includes(keyword)) score += 1;
      });
      
      return { ...event, _matchScore: score };
    });
  }, [events, userInterests]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {needsOnboarding && <InterestOnboarding onComplete={fetchUserInterests} />}
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Discover Events</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Find the best hackathons, conferences, and meetups tailored for you.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <EventFilters filters={filters} setFilters={setFilters} />

      {eventsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-600 dark:text-red-400">
          Error loading events: {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Search className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No events found</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Our AI scrapers haven't picked anything up yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {scoredEvents.map((event, idx) => (
              <motion.div key={`${event.id}-${idx}`} variants={itemVariants} className="h-full">
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
          
          {hasMore && (
            <div className="flex justify-center mt-10 mb-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold rounded-full shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:bg-brand-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isLoadingMore ? 'Loading...' : 'Load More Events'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
