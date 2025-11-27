'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';

function DashboardContent() {
  const router = useRouter();
  const { profile } = useAuthStore();

  useEffect(() => {
    if (profile) {
      if (profile.role === USER_ROLES.RECRUITER) {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard/job-seeker');
      }
    }
  }, [profile, router]);

  return (
    <div>
      <DashboardNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
