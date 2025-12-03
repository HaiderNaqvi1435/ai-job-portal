'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, Building } from 'lucide-react';
import { USER_ROLES } from '@/types';

function InterviewsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('candidateId', '==', user.uid)
      );

      const snapshot = await getDocs(interviewsQuery);
      let interviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort in memory to avoid composite index requirement
      interviewsData.sort((a, b) => {
        const aTime = a.scheduledAt?.seconds || 0;
        const bTime = b.scheduledAt?.seconds || 0;
        return bTime - aTime;
      });

      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Interviews</h1>
          <p className="text-gray-600 mt-2">
            View and join your scheduled interviews
          </p>
        </div>

        {interviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center mb-6">
                No interviews scheduled yet
              </p>
              <Button onClick={() => router.push('/jobs')}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{interview.jobTitle}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {interview.companyName}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Interview Date</p>
                        <p className="text-sm text-gray-600">
                          {interview.scheduledAt?.seconds
                            ? new Date(interview.scheduledAt.seconds * 1000).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Not scheduled'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-gray-600">
                          {interview.scheduledAt?.seconds
                            ? new Date(interview.scheduledAt.seconds * 1000).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {interview.notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Interview Notes</p>
                      <p className="text-sm text-blue-700">{interview.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push(`/dashboard/job-seeker/interviews/${interview.id}`)}
                      disabled={interview.status === 'cancelled' || interview.status === 'completed'}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      {interview.status === 'scheduled' ? 'Join Interview' : 'View Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}

export default function InterviewsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <DashboardLayout>
        <InterviewsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
