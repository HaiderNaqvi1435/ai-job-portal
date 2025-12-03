import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// User operations
export async function createUserProfile(uid, profileData) {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid, updates) {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Job operations
export async function createJob(recruiterId, jobData) {
  try {
    const timestamp = Timestamp.now();
    const newJob = {
      ...jobData,
      recruiterId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = await addDoc(collection(db, 'jobs'), newJob);

    // Return the complete job object with ID
    return {
      id: docRef.id,
      ...newJob,
    };
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

export async function getJobs(filters = {}) {
  try {
    let q = query(collection(db, 'jobs'));

    // If filtering by status, add where clause
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    // Fetch all matching documents
    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt in memory (to avoid requiring composite index)
    jobs.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // descending order
    });

    // Apply limit if specified
    if (filters.limit) {
      jobs = jobs.slice(0, filters.limit);
    }

    return jobs;
  } catch (error) {
    console.error('Error getting jobs:', error);
    throw error;
  }
}

export async function getJobById(jobId) {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (jobDoc.exists()) {
      return { id: jobDoc.id, ...jobDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting job:', error);
    throw error;
  }
}

export async function updateJob(jobId, updates) {
  try {
    await updateDoc(doc(db, 'jobs', jobId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

export async function deleteJob(jobId) {
  try {
    await deleteDoc(doc(db, 'jobs', jobId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

export async function getRecruiterJobs(recruiterId) {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('recruiterId', '==', recruiterId)
    );
    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt in memory (to avoid requiring composite index)
    jobs.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime; // descending order
    });

    return jobs;
  } catch (error) {
    console.error('Error getting recruiter jobs:', error);
    throw error;
  }
}

// Application operations
export async function createApplication(applicationData) {
  try {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...applicationData,
      status: 'pending',
      submittedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...applicationData };
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

export async function getUserApplications(userId) {
  try {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    let applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Enrich applications with job details if missing
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        // If application already has job details, return as is
        if (app.jobTitle && app.companyName && app.location) {
          return app;
        }

        // Otherwise, fetch job details
        try {
          const job = await getJobById(app.jobId);
          if (job) {
            return {
              ...app,
              jobTitle: app.jobTitle || job.title || 'Unknown Job',
              companyName: app.companyName || job.companyName || 'Company',
              location: app.location || job.location || 'Location',
              employmentType: app.employmentType || job.employmentType || 'full-time'
            };
          }
        } catch (error) {
          console.error('Error fetching job details for application:', error);
        }

        return app;
      })
    );

    // Sort in memory to avoid composite index requirement
    enrichedApplications.sort((a, b) => {
      const aTime = a.submittedAt?.seconds || 0;
      const bTime = b.submittedAt?.seconds || 0;
      return bTime - aTime;
    });

    return enrichedApplications;
  } catch (error) {
    console.error('Error getting user applications:', error);
    throw error;
  }
}

export async function getJobApplications(jobId) {
  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId)
    );
    const querySnapshot = await getDocs(q);
    let applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to avoid composite index requirement
    applications.sort((a, b) => {
      const aTime = a.submittedAt?.seconds || 0;
      const bTime = b.submittedAt?.seconds || 0;
      return bTime - aTime;
    });

    return applications;
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw error;
  }
}

export async function updateApplication(applicationId, updates) {
  try {
    await updateDoc(doc(db, 'applications', applicationId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
}

// File upload
export async function uploadFile(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Skill Gap Report operations
export async function createSkillGapReport(reportData) {
  try {
    const docRef = await addDoc(collection(db, 'skillGapReports'), {
      ...reportData,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...reportData };
  } catch (error) {
    console.error('Error creating skill gap report:', error);
    throw error;
  }
}

export async function getSkillGapReports(userId) {
  try {
    const q = query(
      collection(db, 'skillGapReports'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    let reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to avoid composite index requirement
    reports.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return reports;
  } catch (error) {
    console.error('Error getting skill gap reports:', error);
    throw error;
  }
}

// Interview operations
export async function createInterview(interviewData) {
  try {
    const docRef = await addDoc(collection(db, 'interviews'), {
      ...interviewData,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...interviewData };
  } catch (error) {
    console.error('Error creating interview:', error);
    throw error;
  }
}

export async function getInterviews(userId) {
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    let interviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in memory to avoid composite index requirement
    interviews.sort((a, b) => {
      const aTime = a.scheduledAt?.seconds || 0;
      const bTime = b.scheduledAt?.seconds || 0;
      return bTime - aTime;
    });

    return interviews;
  } catch (error) {
    console.error('Error getting interviews:', error);
    throw error;
  }
}

export async function updateInterview(interviewId, updates) {
  try {
    await updateDoc(doc(db, 'interviews', interviewId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating interview:', error);
    throw error;
  }
}
