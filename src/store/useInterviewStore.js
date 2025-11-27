import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useInterviewStore = create(
  devtools(
    (set, get) => ({
      interviews: [],
      loading: false,
      error: null,

      // Set all interviews
      setInterviews: (interviews) => set({ interviews, loading: false, error: null }),

      // Add a new interview
      addInterview: (interview) => set((state) => ({
        interviews: [interview, ...state.interviews],
        loading: false,
        error: null,
      })),

      // Update an existing interview
      updateInterview: (interviewId, updates) => set((state) => ({
        interviews: state.interviews.map((interview) =>
          interview.id === interviewId ? { ...interview, ...updates } : interview
        ),
        loading: false,
        error: null,
      })),

      // Delete an interview
      deleteInterview: (interviewId) => set((state) => ({
        interviews: state.interviews.filter((interview) => interview.id !== interviewId),
        loading: false,
        error: null,
      })),

      // Get interview by ID
      getInterviewById: (interviewId) => {
        const { interviews } = get();
        return interviews.find((interview) => interview.id === interviewId);
      },

      // Get interviews by recruiter
      getInterviewsByRecruiter: (recruiterId) => {
        const { interviews } = get();
        return interviews.filter((interview) => interview.recruiterId === recruiterId);
      },

      // Get interviews by candidate
      getInterviewsByCandidate: (candidateId) => {
        const { interviews } = get();
        return interviews.filter((interview) => interview.candidateId === candidateId);
      },

      // Set loading state
      setLoading: (loading) => set({ loading }),

      // Set error
      setError: (error) => set({ error, loading: false }),

      // Clear all interviews
      clearInterviews: () => set({ interviews: [], loading: false, error: null }),
    }),
    { name: 'interview-store' }
  )
);
