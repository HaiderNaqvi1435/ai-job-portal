'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { getClientCookie, setClientCookie, removeClientCookie } from '@/lib/cookies';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    setSession,
    clearSession,
    setLoading,
  } = useAuthStore();

  // Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const sessionCookie = getClientCookie('session');

      if (!firebaseUser || !sessionCookie) {
        // User is not logged in
        removeClientCookie('session');
        clearSession();
        setLoading(false);

        // Redirect to login if trying to access protected routes
        const publicRoutes = ['/login', '/auth/login', '/auth/register', '/', '/jobs'];
        const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

        if (!isPublicRoute && pathname !== '/') {
          router.replace('/auth/login');
        }
      } else {
        // User is logged in
        try {
          const token = await firebaseUser.getIdToken();

          // Check if we already have the profile in store
          if (!profile || profile.uid !== firebaseUser.uid) {
            const userProfile = await fetchUserProfile(firebaseUser);

            if (userProfile) {
              setSession({
                user: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                },
                profile: userProfile,
                token,
              });

              // Set cookie
              setClientCookie('session', token, {
                expires: 7,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
              });
            }
          }

          setLoading(false);

          // Redirect to dashboard if on login/register pages
          const authRoutes = ['/login', '/auth/login', '/auth/register'];
          if (authRoutes.includes(pathname)) {
            router.replace('/dashboard');
          }
        } catch (error) {
          console.error('Error setting up session:', error);
          clearSession();
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname, profile, setSession, clearSession, setLoading]);

  const signOut = async () => {
    try {
      // Sign out from Firebase
      await firebaseSignOut(auth);

      // Clear cookies
      removeClientCookie('session');

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear session in store
      clearSession();

      // Redirect to login
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signOut,
  };
}
