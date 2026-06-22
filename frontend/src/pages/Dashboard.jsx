import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useEventStore } from '../store/eventStore';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, LayoutDashboard, Bookmark, Compass, Sparkles, Code, ArrowRight, Mail, Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { userInterests, fetchUserInterests, profile, fetchProfile, updateProfile } = useProfileStore();
  const { savedEvents, fetchSavedEvents } = useBookmarkStore();
  const { events, fetchEvents } = useEventStore();
  const navigate = useNavigate();

  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [upcomingSaved, setUpcomingSaved] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  useEffect(() => {
    const fetchAppliedEvents = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('event_reminders')
          .select('has_applied, reminder_days, custom_start_date, reminder_time, events(*)')
          .eq('user_id', user.id)
          .eq('has_applied', true);
          
        if (data && !error) {
          setAppliedEvents(data.map(d => {
            if (!d.events) return null;
            return {
              ...d.events,
              _reminder_days: d.reminder_days,
              _custom_start_date: d.custom_start_date,
              _reminder_time: d.reminder_time
            };
          }).filter(Boolean));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppliedEvents();
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchUserInterests();
    fetchSavedEvents();
    fetchEvents({}, 1);
  }, [fetchProfile, fetchUserInterests, fetchSavedEvents, fetchEvents]);

  useEffect(() => {
    try {
      const validEvents = Array.isArray(events) ? events.filter(e => e && e.id) : [];
      const validSaved = Array.isArray(savedEvents) ? savedEvents.filter(e => e && e.id) : [];
      
      const appliedIds = new Set(appliedEvents.map(e => e.id));
      const savedIds = new Set(validSaved.map(e => e.id));
      
      // Extract user interest keywords
      const safeInterests = Array.isArray(userInterests) ? userInterests : [];
      const interestKeywords = safeInterests
        .map(i => typeof i === 'string' ? i.toLowerCase() : (i?.name || '').toLowerCase())
        .filter(Boolean);

      const isDiversityBoost = profile?.gender === 'Female' || profile?.gender === 'Non-Binary';
      const diversityKeywords = ['women', 'female', 'girls', 'witi'];

      // Score and sort events for recommendations
      const unselectedEvents = validEvents.filter(e => !savedIds.has(e.id) && !appliedIds.has(e.id));
      
      const scoredEvents = unselectedEvents.map(event => {
        let score = 0;
        const textToSearch = `${event.title || ''} ${event.description || ''} ${event.tags || ''}`.toLowerCase();
        
        // Add points for matching user interests
        interestKeywords.forEach(keyword => {
          if (textToSearch.includes(keyword)) score += 10;
        });

        // Boost diversity events heavily if user matches
        if (isDiversityBoost) {
          diversityKeywords.forEach(keyword => {
            // using word boundaries if possible, but simple include works for a demo
            if (textToSearch.includes(keyword)) score += 25; // massive boost
          });
        }

        // Add small random factor to ensure variety (0 to 5 points)
        score += Math.random() * 5;

        // Bias towards newer/upcoming events if date exists
        if (event.start_date) {
          const daysUntil = (new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24);
          if (daysUntil > 0 && daysUntil < 30) {
            score += 5; // Extra points for events in the next month
          }
        }

        return { ...event, _score: score };
      });

      // Sort by score descending
      scoredEvents.sort((a, b) => b._score - a._score);
      
      const recommendations = scoredEvents.slice(0, 4); // Show top 4
      setRecommendedEvents(recommendations);

      const filteredSaved = validSaved.filter(e => !appliedIds.has(e.id));
      const sortedSaved = [...filteredSaved].sort((a, b) => {
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
  }, [events, savedEvents, appliedEvents, userInterests, profile]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (!user) return null;

  const handleSubscriptionChange = async (freq) => {
    setIsUpdatingSub(true);
    try {
      await updateProfile({ newsletter_frequency: freq });
    } catch (err) {
      console.error("Failed to update subscription", err);
    } finally {
      setIsUpdatingSub(false);
    }
  };

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
        className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            Welcome back, {safeUsername}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Here's what's happening with your hackathons and events.
          </p>
          
          {safeInterests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {safeInterests.slice(0, 5).map((interest, idx) => (
                <span key={`interest-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Code className="w-3 h-3 mr-1" />
                  {typeof interest === 'string' ? interest : (interest.name || 'Interest')}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-0 flex flex-row items-center gap-6 bg-white/80 dark:bg-slate-900/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-full p-2">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{safeSavedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Saved</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50"></div>
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full p-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{appliedEvents.length}</div>
              <div className="text-xs text-slate-500 font-medium">Applied</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Applied Events */}
          {appliedEvents.length > 0 && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                    Applied Events
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appliedEvents.map((event, idx) => (
                  <motion.div key={event?.id || idx} variants={itemVariants} className="h-full">
                    {event && <EventCard event={event} />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Recommendations */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                  Top Recommendations
                </h2>
              </div>
              <Link to="/discover" className="text-[13px] font-semibold text-brand-600 hover:text-brand-500 flex items-center transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {isDataReady && recommendedEvents.length > 0 ? (
              <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {recommendedEvents.map((event, idx) => (
                  <motion.div key={event?.id || idx} variants={itemVariants} className="w-[85%] sm:w-[320px] shrink-0 snap-start h-full">
                    {event && <EventCard event={event} />}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center shadow-sm">
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
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center mb-6">
              Upcoming Schedule
            </h2>

            {isDataReady && appliedEvents.length > 0 ? (
              <div className="relative border-l-2 border-slate-300 dark:border-slate-800 ml-2 space-y-8 pb-4">
                {appliedEvents.slice(0, 5).map((event, idx) => {
                  let reminderText = null;
                  if (event._reminder_days) {
                    const baseDate = event._custom_start_date || event.start_date;
                    if (baseDate) {
                      const rDate = new Date(baseDate);
                      rDate.setDate(rDate.getDate() - event._reminder_days);
                      const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(rDate);
                      
                      let timeString = '08:00 AM'; // fallback
                      if (event._reminder_time) {
                        const [hours, minutes] = event._reminder_time.split(':');
                        const h = parseInt(hours, 10);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const h12 = h % 12 || 12;
                        timeString = `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                      }
                      
                      reminderText = `${formattedDate} at ${timeString}`;
                    }
                  }

                  const eventDate = event?.start_date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(event.start_date)) : 'TBA';

                  return (
                    <div key={event?.id || idx} className="relative pl-6">
                      <div className="absolute w-2.5 h-2.5 bg-brand-500 rounded-full -left-[5px] top-1.5 border-2 border-white dark:border-slate-950"></div>
                      
                      <Link 
                        to={event ? `/event/${event.id}` : '#'}
                        className="group block"
                      >
                        <div className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">
                          {eventDate}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-tight">
                          {event?.title || 'Unknown Event'}
                        </h4>
                        
                        {reminderText && (
                          <div className="mt-2 flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/50 inline-flex px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                            <Bell className="w-3 h-3 mr-1.5 text-brand-500" />
                            Reminder: {reminderText}
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-transparent">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your schedule is clear</p>
              </div>
            )}
          </motion.div>
          
          {/* Newsletter Banner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-brand-100/60 dark:bg-brand-900/10 backdrop-blur-md border border-brand-300 dark:border-brand-800/30 rounded-2xl p-4 flex flex-row items-center gap-4 mt-8 shadow-sm"
          >
            <div className="bg-brand-100 dark:bg-brand-900/40 p-2 rounded-full shrink-0">
              <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              {(!profile?.newsletter_frequency || profile?.newsletter_frequency === 'none') ? (
                <>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Never miss an event</h3>
                  <Link 
                    to="/profile" 
                    className="text-[12px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 mt-0.5 inline-block"
                  >
                    Set up email digests &rarr;
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Active Digest</h3>
                  <Link 
                    to="/profile" 
                    className="text-[12px] font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 mt-0.5 inline-block"
                  >
                    Manage <span className="capitalize">{profile.newsletter_frequency}</span> sub &rarr;
                  </Link>
                </>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
