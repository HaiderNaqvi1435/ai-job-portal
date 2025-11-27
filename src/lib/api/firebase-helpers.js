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
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      recruiterId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...jobData };
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

export async function getJobs(filters = {}) {
  try {
    let q = query(collection(db, 'jobs'));

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
      where('recruiterId', '==', recruiterId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user applications:', error);
    throw error;
  }
}

export async function getJobApplications(jobId) {
  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
      where('userId', '==', userId),
      orderBy('scheduledAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
