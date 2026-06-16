import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink, Tag, Bookmark, CalendarPlus } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { motion } from 'framer-motion';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { savedEventIds, toggleBookmark } = useBookmarkStore();
  const isSaved = savedEventIds.has(event.id);

  // Safe formatting for dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date TBA';
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }).format(date);
    } catch {
      return 'Date TBA';
    }
  };

  // Safe check for valid image string
  const hasImage = event.cover_image && event.cover_image !== 'null' && event.cover_image !== 'None' && event.cover_image.trim() !== '';

  // Generate a gorgeous, unique, deterministic fallback image based on the event's unique ID
  const getFallbackImage = () => {
    if (!event.id) return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
    // Use picsum.photos with a seed so the image is beautifully unique but always stays the same for this specific event
    return `https://picsum.photos/seed/${event.id}/800/400`;
  };

  const getGoogleCalendarUrl = (event) => {
    const formatGoogleDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
      } catch {
        return '';
      }
    };

    const start = formatGoogleDate(event.start_date);
    // If no valid dates, return base template
    if (!start) return 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    
    // If no end date, make it a 1-hour event block from start
    let end = formatGoogleDate(event.end_date);
    if (!end) {
      const startDate = new Date(event.start_date);
      startDate.setHours(startDate.getHours() + 1);
      end = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    }

    const title = encodeURIComponent(event.title || 'Event');
    // Include the registration link in the details so they can easily find it!
    const externalLink = event.registration_link || event.source_url || '';
    const detailsText = `${event.description || ''}\n\nLink: ${externalLink}`;
    const details = encodeURIComponent(detailsText);
    const location = encodeURIComponent(event.venue || '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  return (
    <motion.div 
      onClick={() => navigate(`/event/${event.id}`)}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col h-full cursor-pointer transition-colors"
    >
      
      {/* Top Banner Area */}
      <div 
        className="h-36 relative flex flex-col justify-between p-4 bg-cover bg-center bg-no-repeat bg-slate-200"
        style={{ backgroundImage: `url(${hasImage ? event.cover_image : getFallbackImage()})` }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex gap-2">
              {event.event_type && event.event_type !== 'Event' && !(event.title || '').toLowerCase().includes(event.event_type.toLowerCase()) && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-sm">
                  {event.event_type}
                </span>
              )}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                event.mode === 'Online' 
                ? 'bg-green-400/20 text-green-50 backdrop-blur-md' 
                : 'bg-blue-400/20 text-blue-50 backdrop-blur-md'
              }`}>
                {event.mode || 'Online'}
              </span>
            </div>
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                toggleBookmark(event); 
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 shadow-sm ${
                isSaved 
                ? 'bg-brand-500 text-white shadow-brand-500/30' 
                : 'bg-black/20 text-white hover:bg-black/40 hover:text-brand-300'
              }`}
              title={isSaved ? "Remove from Saved" : "Save Event"}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
          
          {/* Smart Recommendation Badge */}
          {event._matchScore && event._matchScore > 0 ? (
            <div className="self-start mt-auto inline-block px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md border border-white/20">
              ✨ Recommended Match
            </div>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            by {event.organizer || event.source_platform}
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 flex-grow">
          {event.description && event.description.trim() !== '' 
            ? event.description 
            : 'Details for this event are available on the organizer\'s website. Click the link below to learn more and register.'}
        </p>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Details */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-brand-500" />
            <span className="truncate">
              {formatDate(event.start_date)} {event.end_date && `- ${formatDate(event.end_date)}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 truncate pr-2">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-brand-500" />
              <span className="truncate">{event.venue || 'Online'}</span>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={getGoogleCalendarUrl(event)} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus className="w-4 h-4" />
              </a>
              <a 
                href={event.registration_link || event.source_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center p-2 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 transition-colors"
                title="Apply External"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
