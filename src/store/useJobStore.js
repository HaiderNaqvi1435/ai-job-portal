import { create } from 'zustand';

export const useJobStore = create((set) => ({
  jobs: [],
  selectedJob: null,
  filters: {
    search: '',
    location: '',
    employmentType: [],
    experienceLevel: [],
    skills: [],
  },
  loading: false,

  setJobs: (jobs) => set({ jobs }),

  setSelectedJob: (job) => set({ selectedJob: job }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  resetFilters: () => set({
    filters: {
      search: '',
      location: '',
      employmentType: [],
      experienceLevel: [],
      skills: [],
    }
  }),

  setLoading: (loading) => set({ loading }),

  addJob: (job) => set((state) => ({
    jobs: [job, ...state.jobs]
  })),

  updateJob: (jobId, updates) => set((state) => ({
    jobs: state.jobs.map(job =>
      job.id === jobId ? { ...job, ...updates } : job
    )
  })),

  deleteJob: (jobId) => set((state) => ({
    jobs: state.jobs.filter(job => job.id !== jobId)
  })),
}));
