import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useProfileStore = create((set, get) => ({
  profile: null,
  allInterests: [],
  userInterests: [],
  loading: false,
  error: null,

  fetchProfile: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadAvatar: async (file) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      await get().updateProfile({ profile_photo: data.publicUrl });
      
      return data.publicUrl;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAllInterests: async () => {
    try {
      const { data, error } = await supabase.from('interests').select('*').order('name');
      if (error) throw error;
      set({ allInterests: data });
    } catch (error) {
      console.error("Error fetching interests:", error);
    }
  },

  fetchUserInterests: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest_id, interests(*)')
        .eq('user_id', user.id);
        
      if (error) throw error;
      set({ userInterests: data.map(ui => ui.interests) });
    } catch (error) {
      console.error("Error fetching user interests:", error);
    }
  },

  saveUserInterests: async (interestIds) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      // First, delete existing
      await supabase.from('user_interests').delete().eq('user_id', user.id);
      
      // Then insert new ones
      if (interestIds.length > 0) {
        const insertData = interestIds.map(id => ({ user_id: user.id, interest_id: id }));
        const { error } = await supabase.from('user_interests').insert(insertData);
        if (error) throw error;
      }
      
      // Refresh user interests
      await get().fetchUserInterests();
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}))
