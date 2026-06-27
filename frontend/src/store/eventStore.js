import { create } from 'zustand'
import axios from 'axios'
import { useAuthStore } from './authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = BASE_URL.endsWith('/api/events') ? BASE_URL : `${BASE_URL}/api/events`;

export const useEventStore = create((set) => ({
  events: [],
  currentEvent: null,
  loading: false,
  error: null,

  hasMore: true,

  fetchEvents: async (filters = {}, page = 1) => {
    const { user } = useAuthStore.getState();
    const isNewQuery = page === 1;

    if (isNewQuery) set({ loading: true, error: null });
    else set({ error: null }); // Don't wipe UI while fetching next page

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.mode) params.append('mode', filters.mode);
      if (filters.source_platform) params.append('source_platform', filters.source_platform);
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page);
      params.append('limit', 12);
      if (user) params.append('user_id', user.id);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await axios.get(`${API_URL}${queryString}`);
      
      const newEvents = response.data.data;
      
      set((state) => ({ 
        events: isNewQuery ? newEvents : [...state.events, ...newEvents],
        hasMore: response.data.hasMore,
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  },

  fetchEventById: async (id) => {
    set({ loading: true, error: null, currentEvent: null });
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      set({ currentEvent: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
    }
  }
}))
