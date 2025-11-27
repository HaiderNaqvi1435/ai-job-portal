import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        loading: true,

        setUser: (user) => set({ user }),

        setProfile: (profile) => set({ profile }),

        setToken: (token) => set({ token }),

        setLoading: (loading) => set({ loading }),

        setSession: ({ user, profile, token }) => set({
          user,
          profile,
          token,
          isAuthenticated: true,
          loading: false,
        }),

        clearSession: () => set({
          user: null,
          profile: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        }),

        logout: () => set({
          user: null,
          profile: null,
          token: null,
          isAuthenticated: false,
        }),

        updateProfile: (updates) => set((state) => ({
          profile: { ...state.profile, ...updates }
        })),

        // Check if user is authenticated
        checkAuth: () => {
          const { user, profile } = get();
          return !!(user && profile);
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          profile: state.profile,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
