import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useBookmarkStore = create((set, get) => ({
  savedEvents: [],
  savedEventIds: new Set(),
  loading: false,
  error: null,

  fetchSavedEvents: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('saved_events')
        .select('event_id, events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const events = data.map(item => item.events);
      const ids = new Set(events.map(e => e.id));
      
      set({ savedEvents: events, savedEventIds: ids, loading: false });
    } catch (error) {
      console.error("Error fetching saved events:", error);
      set({ error: error.message, loading: false });
    }
  },

  toggleBookmark: async (event) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { savedEventIds, savedEvents } = get();
    const isSaved = savedEventIds.has(event.id);

    try {
      if (isSaved) {
        // Remove bookmark
        const { error } = await supabase
          .from('saved_events')
          .delete()
          .match({ user_id: user.id, event_id: event.id });
          
        if (error) throw error;
        
        const newIds = new Set(savedEventIds);
        newIds.delete(event.id);
        
        set({ 
          savedEventIds: newIds,
          savedEvents: savedEvents.filter(e => e.id !== event.id)
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('saved_events')
          .insert({ user_id: user.id, event_id: event.id });
          
        if (error) throw error;
        
        const newIds = new Set(savedEventIds);
        newIds.add(event.id);
        
        set({ 
          savedEventIds: newIds,
          savedEvents: [event, ...savedEvents]
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert(`Bookmark Error: ${error.message || JSON.stringify(error)}`);
    }
  }
}))
