import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useEventStore } from '../store/eventStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, LayoutDashboard, Bookmark, Compass, Sparkles, Code, ArrowRight } from 'lucide-react';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { userInterests, fetchUserInterests } = useProfileStore();
  const { savedEvents, fetchSavedEvents } = useBookmarkStore();
  const { events, fetchEvents } = useEventStore();
  const navigate = useNavigate();

  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [upcomingSaved, setUpcomingSaved] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    fetchUserInterests();
    fetchSavedEvents();
    fetchEvents({}, 1);
  }, [fetchUserInterests, fetchSavedEvents, fetchEvents]);

  useEffect(() => {
    try {
      const validEvents = Array.isArray(events) ? events.filter(e => e && e.id) : [];
      const validSaved = Array.isArray(savedEvents) ? savedEvents.filter(e => e && e.id) : [];
      
      const savedIds = new Set(validSaved.map(e => e.id));
      const recommendations = validEvents.filter(e => !savedIds.has(e.id)).slice(0, 3);
      setRecommendedEvents(recommendations);

      const sortedSaved = [...validSaved].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
      setUpcomingSaved(sortedSaved);
      
      setIsDataReady(true);
    } catch (err) {
      console.error("Error processing dashboard data:", err);
      setIsDataReady(true); // Still render UI even if processing failed
    }
  }, [events, savedEvents]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (!user) return null;

  // Extremely safe fallback values
  const safeUsername = user?.username || (user?.email ? user.email.split('@')[0] : 'Developer');
  const safeInterests = Array.isArray(userInterests) ? userInterests : [];
  const safeSavedCount = Array.isArray(savedEvents) ? savedEvents.filter(e => e).length : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-brand-500" />
            Welcome back, {safeUsername}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Here's what's happening with your hackathons and events.
          </p>
          
          {safeInterests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {safeInterests.slice(0, 5).map((interest, idx) => (
                <span key={`interest-${idx}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  <Code className="w-3 h-3 mr-1" />
                  {typeof interest === 'string' ? interest : 'Interest'}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-0 flex flex-col items-end gap-3">
          <div className="bg-brand-50 dark:bg-brand-900/20 px-6 py-4 rounded-2xl border border-brand-100 dark:border-brand-800/50 text-center">
            <div className="text-3xl font-black text-brand-600 dark:text-cyan-400">{safeSavedCount}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Saved Events</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Recommendations */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-purple-500" /> Top Recommendations
                </h2>
                <p className="text-sm text-slate-500 mt-1">Based on your tech stack and interests.</p>
              </div>
              <Link to="/discover" className="text-sm font-semibold text-brand-600 hover:text-brand-500 flex items-center transition-colors">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {isDataReady && recommendedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedEvents.map((event, idx) => (
                  <motion.div key={event?.id || idx} variants={itemVariants} className="h-full">
                    {event && <EventCard event={event} />}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center">
                <Compass className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Discovering events...</h3>
                <p className="text-slate-500 mt-2">Check back soon for personalized recommendations.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Area (Right 1/3) */}
        <div className="space-y-8">
          
          {/* Upcoming Schedule Mini-Calendar Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center mb-6">
              <Calendar className="w-5 h-5 mr-2 text-cyan-500" /> Your Upcoming Schedule
            </h2>

            {isDataReady && upcomingSaved.length > 0 ? (
              <div className="space-y-4">
                {upcomingSaved.slice(0, 5).map((event, idx) => {
                  if (!event) return null;
                  
                  let month = "TBA";
                  let day = "--";
                  
                  if (event.date) {
                    try {
                      const eventDate = new Date(event.date);
                      if (!isNaN(eventDate.getTime())) {
                        month = eventDate.toLocaleString('default', { month: 'short' });
                        day = eventDate.getDate();
                      }
                    } catch (e) {
                      // ignore invalid dates
                    }
                  }

                  return (
                    <div 
                      key={event.id || idx} 
                      onClick={() => event.id && navigate(`/event/${event.id}`)}
                      className="flex items-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                    >
                      <div className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 rounded-lg p-2 text-center min-w-[60px] mr-4 border border-brand-100 dark:border-brand-800/50">
                        <div className="text-xs font-bold uppercase">{month}</div>
                        <div className="text-xl font-black">{day}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.title || 'Unknown Event'}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{event.source_platform || 'NexusEvents'}</p>
                      </div>
                    </div>
                  );
                })}
                {upcomingSaved.length > 5 && (
                  <Link to="/saved" className="block text-center text-sm font-semibold text-slate-500 hover:text-cyan-500 transition-colors mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    View all saved events
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No events saved yet.</p>
                <Link to="/discover" className="text-brand-600 dark:text-cyan-400 text-sm font-semibold hover:underline mt-2 inline-block">Find events</Link>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
