import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ loading }),

      logout: () => set({ user: null, profile: null }),

      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);
