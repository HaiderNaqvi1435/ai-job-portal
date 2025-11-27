'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';

function DashboardContent() {
  const router = useRouter();
  const { profile, loading } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for loading to finish and profile to be available
    if (!loading && profile && !isRedirecting) {
      setIsRedirecting(true);

      // Redirect based on role
      if (profile.role === USER_ROLES.RECRUITER) {
        router.replace('/dashboard/recruiter');
      } else if (profile.role === USER_ROLES.JOB_SEEKER) {
        router.replace('/dashboard/job-seeker');
      } else {
        // Default fallback
        router.replace('/dashboard/job-seeker');
      }
    }
  }, [profile, loading, router, isRedirecting]);

  return (
    <div>
      <DashboardNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading your profile...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
