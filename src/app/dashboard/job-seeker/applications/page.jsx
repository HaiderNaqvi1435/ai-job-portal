'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES, APPLICATION_STATUS } from '@/types';
import { FileText, Calendar, Building2, MapPin, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserApplications } from '@/lib/api/firebase-helpers';

function MyApplicationsContent() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (user?.uid) {
        try {
          const userApps = await getUserApplications(user.uid);
          setApplications(userApps);
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplications();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case APPLICATION_STATUS.SHORTLISTED:
        return 'bg-green-100 text-green-700';
      case APPLICATION_STATUS.INTERVIEW_SCHEDULED:
        return 'bg-blue-100 text-blue-700';
      case APPLICATION_STATUS.REJECTED:
        return 'bg-red-100 text-red-700';
      case APPLICATION_STATUS.REVIEWED:
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Track and manage your job applications
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </CardContent>
          </Card>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {application.jobTitle || 'Job Title'}
                        </h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          Company Name
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied {new Date(application.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">ATS Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(application.atsScore || 0)}`}>
                            {application.atsScore || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Fit Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(application.fitScore || 0)}`}>
                            {application.fitScore || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Match</p>
                          <div className="flex items-center justify-center">
                            <TrendingUp className={`h-6 w-6 ${getScoreColor((application.atsScore + application.fitScore) / 2)}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Link href={`/jobs/${application.jobId}`}>
                        <Button variant="outline" size="sm">
                          View Job
                        </Button>
                      </Link>
                      <Link href={application.resumeUrl || '#'} target="_blank">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Status Timeline (Optional) */}
                  {application.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Interview Scheduled
                      </p>
                      <p className="text-sm text-blue-700">
                        You have an upcoming interview for this position
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't applied to any jobs yet. Start browsing!
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MyApplicationsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <MyApplicationsContent />
    </ProtectedRoute>
  );
}
