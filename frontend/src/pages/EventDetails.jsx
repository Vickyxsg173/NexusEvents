import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Calendar, MapPin, ExternalLink, Tag, Bookmark, ArrowLeft, Users, Trophy, CheckCircle2, X, Bell } from 'lucide-react';
import ApplyReminderModal from '../components/ApplyReminderModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentEvent: event, fetchEventById, loading, error } = useEventStore();
  const { savedEventIds, toggleBookmark, fetchSavedEvents } = useBookmarkStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [modalMode, setModalMode] = useState('apply');
  const [hasApplied, setHasApplied] = useState(false);
  const [reminderDays, setReminderDays] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEventById(id);
    fetchSavedEvents();
  }, [id, fetchEventById, fetchSavedEvents]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !id) return;
      try {
        const { data, error } = await supabase
          .from('event_reminders')
          .select('has_applied, reminder_days')
          .eq('user_id', user.id)
          .eq('event_id', id)
          .maybeSingle();
          
        if (data && data.has_applied) {
          setHasApplied(true);
          if (data.reminder_days) {
            setReminderDays(data.reminder_days);
          }
        }
      } catch (err) {
        console.error("Failed to check application status", err);
      }
    };
    checkApplicationStatus();
  }, [user, id]);

  const handleApplicationConfirmed = () => {
    setHasApplied(true);
  };

  const handleRemoveApplication = async () => {
    if (!user || !id) return;
    try {
      setHasApplied(false); // Optimistic UI update
      setReminderDays(null);
      await supabase
        .from('event_reminders')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', id);
    } catch (err) {
      console.error("Failed to remove application", err);
      setHasApplied(true); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-xl text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Event Not Found</h2>
          <p className="text-red-500 mb-6">{error || "This event may have been removed."}</p>
          <button onClick={() => navigate(-1)} className="text-brand-600 font-medium hover:underline flex items-center justify-center mx-auto">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discover
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedEventIds.has(event.id);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      return new Intl.DateTimeFormat('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return 'Date TBA';
    }
  };

  const getFallbackGradient = () => {
    const category = (event.category || '').toLowerCase();
    const type = (event.event_type || '').toLowerCase();
    const combined = `${category} ${type}`;
    if (combined.includes('ai') || combined.includes('machine learning')) return 'linear-gradient(135deg, #8b5cf6, #4c1d95)'; 
    if (combined.includes('web') || combined.includes('frontend')) return 'linear-gradient(135deg, #ec4899, #be185d)'; 
    if (combined.includes('cyber') || combined.includes('security')) return 'linear-gradient(135deg, #10b981, #047857)'; 
    if (combined.includes('blockchain') || combined.includes('web3')) return 'linear-gradient(135deg, #f59e0b, #b45309)'; 
    if (combined.includes('hackathon')) return 'linear-gradient(135deg, #f43f5e, #9f1239)'; 
    return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
  };

  const hasImage = event.cover_image && event.cover_image !== 'null' && event.cover_image !== 'None';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-12">
      {/* Massive Hero Banner */}
      <div 
        className="w-full h-80 md:h-[400px] relative bg-cover bg-center"
        style={hasImage ? { backgroundImage: `url(${event.cover_image})` } : { backgroundImage: getFallbackGradient() }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-10">
          <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors cursor-pointer border-none outline-none">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-5xl mx-auto px-6 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                <span className="px-3 py-1 bg-brand-500/80 backdrop-blur-md text-white text-sm font-semibold rounded-full shadow-lg">
                  {event.event_type || 'Event'}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full shadow-lg backdrop-blur-md ${
                  event.mode === 'Online' ? 'bg-green-500/80 text-white' : 'bg-blue-500/80 text-white'
                }`}>
                  {event.mode || 'Online'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
                {event.title}
              </h1>
              <p className="text-lg text-slate-300 font-medium flex items-center">
                Organized by <span className="text-white ml-2 font-bold">{event.organizer || event.source_platform}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => toggleBookmark(event)}
                className={`px-8 py-3 h-[52px] rounded-xl font-bold flex items-center justify-center transition-all ${
                  isSaved 
                  ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600' 
                  : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl'
                }`}
              >
                <Bookmark className="w-5 h-5 mr-2" fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save Event"}
              </button>
              
              {hasApplied ? (
                <div className="flex flex-col gap-2 items-center justify-center">
                  <button 
                    onClick={handleRemoveApplication}
                    className="group w-full h-[52px] px-8 py-3 rounded-xl font-bold flex items-center justify-center text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:border-red-800/50 transition-all"
                    title="Click to remove application"
                  >
                    <span className="flex items-center group-hover:hidden">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Applied
                    </span>
                    <span className="hidden items-center group-hover:flex">
                      <X className="w-5 h-5 mr-2" /> Remove
                    </span>
                  </button>
                  {reminderDays && (
                    <div className="text-xs text-slate-300 font-medium flex items-center bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                      <Bell className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                      Reminder set for {reminderDays} day{reminderDays === 1 ? '' : 's'} before
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setModalMode('reminder_only');
                      setShowApplyModal(true);
                    }}
                    className="px-8 py-3 h-[52px] rounded-xl font-bold flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800/50 shadow-xl transition-all"
                  >
                    <Bell className="w-5 h-5 mr-2" /> Set Reminder
                  </button>
                  <a 
                    href={event.registration_link || event.source_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => {
                      setModalMode('apply');
                      // Wait a split second so the new tab opens first, then show modal
                      setTimeout(() => setShowApplyModal(true), 500);
                    }}
                    className="px-8 py-3 h-[52px] rounded-xl font-bold flex items-center justify-center text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-1"
                  >
                    Apply Now <ExternalLink className="w-5 h-5 ml-2" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column - Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About this Event</h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {event.description || "No description provided."}
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Relevant Tags</h3>
              <div className="flex flex-wrap gap-3">
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    <Tag className="w-4 h-4 mr-2 text-brand-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Info Box */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6 sticky top-24">
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Schedule</h3>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-brand-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">{formatDate(event.start_date)}</p>
                  {event.end_date && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">To: {formatDate(event.end_date)}</p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Location</h3>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-brand-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">{event.mode}</p>
                  {event.venue && event.venue !== 'Online' && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{event.venue}</p>
                  )}
                </div>
              </div>
            </div>

            {(event.prize_pool || event.eligibility) && (
              <>
                <hr className="border-slate-100 dark:border-slate-700" />
                
                {event.prize_pool && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Prize Pool</h3>
                    <div className="flex items-start">
                      <Trophy className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
                      <p className="text-slate-900 dark:text-white font-medium">{event.prize_pool}</p>
                    </div>
                  </div>
                )}

                {event.eligibility && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Eligibility</h3>
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <p className="text-slate-900 dark:text-white font-medium">{event.eligibility}</p>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
        
      </div>

      <ApplyReminderModal 
        event={event} 
        isOpen={showApplyModal} 
        mode={modalMode}
        onClose={() => setShowApplyModal(false)} 
        onApplicationConfirmed={handleApplicationConfirmed}
        onReminderSaved={(days) => {
          setReminderDays(days);
          if (modalMode === 'reminder_only' && !isSaved) {
            toggleBookmark(event);
          }
        }}
      />
    </div>
  );
}
