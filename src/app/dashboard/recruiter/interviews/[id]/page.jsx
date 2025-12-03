'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import WebRTCVideoRoom from '@/components/interview/WebRTCVideoRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { USER_ROLES } from '@/types';

function InterviewContent() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInterview();
  }, [params.id]);

  const fetchInterview = async () => {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', params.id));
      if (interviewDoc.exists()) {
        setInterview({ id: interviewDoc.id, ...interviewDoc.data() });
      } else {
        setError('Interview not found');
      }
    } catch (err) {
      console.error('Error fetching interview:', err);
      setError('Failed to load interview');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCall = () => {
    router.push('/dashboard/recruiter/interviews');
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

  if (error || !interview) {
    return (
      <div>
        <DashboardNav />
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error || 'Interview not found'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/dashboard/recruiter/interviews')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/recruiter/interviews')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Interviews
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interview Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
                <CardDescription>Scheduled interview information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Candidate</p>
                    <p className="text-sm text-gray-600">{interview.candidateName}</p>
                    <p className="text-xs text-gray-500">{interview.candidateEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-gray-600">
                      {interview.scheduledAt?.seconds
                        ? new Date(interview.scheduledAt.seconds * 1000).toLocaleDateString()
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-gray-600">
                      {interview.scheduledAt?.seconds
                        ? new Date(interview.scheduledAt.seconds * 1000).toLocaleTimeString()
                        : 'Not scheduled'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    interview.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : interview.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {interview.status}
                  </span>
                </div>

                {interview.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <p className="text-sm text-gray-600">{interview.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Room */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Video Interview</CardTitle>
                <CardDescription>
                  Conduct the video interview with the candidate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebRTCVideoRoom
                  roomId={params.id}
                  isInitiator={true}
                  onLeave={handleLeaveCall}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <InterviewContent />
    </ProtectedRoute>
  );
}
