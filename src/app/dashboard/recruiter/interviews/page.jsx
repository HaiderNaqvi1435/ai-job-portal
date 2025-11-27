'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Video, User } from 'lucide-react';
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
        where('recruiterId', '==', user.uid),
        orderBy('scheduledAt', 'desc')
      );

      const snapshot = await getDocs(interviewsQuery);
      const interviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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
      <div>
        <DashboardNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Interview Schedule</h1>
          <p className="text-gray-600 mt-2">
            Manage and conduct video interviews with candidates
          </p>
        </div>

        {interviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center mb-6">
                No interviews scheduled yet
              </p>
              <Button onClick={() => router.push('/dashboard/recruiter/applicants')}>
                View Applicants
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
                      <CardTitle className="text-xl">
                        Interview with {interview.candidateName}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {interview.jobTitle}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Candidate</p>
                        <p className="text-sm text-gray-600">{interview.candidateEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(interview.scheduledAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => router.push(`/dashboard/recruiter/interviews/${interview.id}`)}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      {interview.status === 'scheduled' ? 'Start Interview' : 'View Interview'}
                    </Button>
                    {interview.notes && (
                      <Button variant="outline">View Notes</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <InterviewsContent />
    </ProtectedRoute>
  );
}
