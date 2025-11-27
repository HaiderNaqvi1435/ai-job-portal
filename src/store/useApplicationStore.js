import { create } from 'zustand';

export const useApplicationStore = create((set) => ({
  applications: [],
  myApplications: [],
  loading: false,

  setApplications: (applications) => set({ applications }),

  setMyApplications: (myApplications) => set({ myApplications }),

  setLoading: (loading) => set({ loading }),

  addApplication: (application) => set((state) => ({
    applications: [application, ...state.applications],
    myApplications: [application, ...state.myApplications]
  })),

  updateApplication: (applicationId, updates) => set((state) => ({
    applications: state.applications.map(app =>
      app.id === applicationId ? { ...app, ...updates } : app
    ),
    myApplications: state.myApplications.map(app =>
      app.id === applicationId ? { ...app, ...updates } : app
    )
  })),
}));
