'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { USER_ROLES, APPLICATION_STATUS } from '@/types';
import {
  Briefcase,
  Users,
  Video,
  CheckCircle,
  Plus,
  Sparkles,
  Eye,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useJobStore } from '@/store/useJobStore';
import { getRecruiterJobs } from '@/lib/api/firebase-helpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function RecruiterDashboardContent() {
  const { profile } = useAuthStore();
  const { jobs, setJobs } = useJobStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    interviewsScheduled: 0,
    positionsFilled: 0,
  });
  const [jobApplicationCounts, setJobApplicationCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.uid) {
        try {
          const recruiterJobs = await getRecruiterJobs(profile.uid);

          // IMMEDIATELY update Zustand store
          setJobs(recruiterJobs);

          // Fetch applications for all jobs
          const jobIds = recruiterJobs.map(job => job.id);
          let totalApplicants = 0;
          let interviewsScheduled = 0;
          let positionsFilled = 0;
          const applicantCounts = {};

          if (jobIds.length > 0) {
            // Fetch applications in batches (Firebase 'in' query has limit of 10)
            const batchSize = 10;
            for (let i = 0; i < jobIds.length; i += batchSize) {
              const batchJobIds = jobIds.slice(i, i + batchSize);
              const applicationsQuery = query(
                collection(db, 'applications'),
                where('jobId', 'in', batchJobIds)
              );
              const applicationsSnapshot = await getDocs(applicationsQuery);

              applicationsSnapshot.docs.forEach(doc => {
                const app = doc.data();
                const jobId = app.jobId;

                // Count total applicants
                totalApplicants++;

                // Count per job
                applicantCounts[jobId] = (applicantCounts[jobId] || 0) + 1;

                // Count interviews
                if (app.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
                  interviewsScheduled++;
                }

                // Count filled positions
                if (app.status === APPLICATION_STATUS.HIRED) {
                  positionsFilled++;
                }
              });
            }
          }

          setJobApplicationCounts(applicantCounts);

          setStats({
            activeJobs: recruiterJobs.filter(j => j.status === 'active').length,
            totalApplicants,
            interviewsScheduled,
            positionsFilled,
          });
        } catch (error) {
          console.error('Error fetching jobs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [profile, setJobs]);

  const quickActions = [
    {
      icon: Plus,
      title: 'Post New Job',
      description: 'Create a new job posting',
      href: '/dashboard/recruiter/jobs/create',
      color: 'blue',
    },
    {
      icon: Sparkles,
      title: 'AI Job Generator',
      description: 'Generate job description with AI',
      href: '/dashboard/recruiter/generate-job',
      color: 'purple',
    },
    {
      icon: Users,
      title: 'View All Applicants',
      description: 'Review all job applications',
      href: '/dashboard/recruiter/applicants',
      color: 'green',
    },
    {
      icon: Video,
      title: 'Interviews',
      description: 'Manage video interviews',
      href: '/dashboard/recruiter/interviews',
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600">
            {profile?.companyName || 'Your Company'} - Recruiter Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/recruiter/jobs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold">{stats.activeJobs}</p>
                  </div>
                  <Briefcase className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/recruiter/applicants">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applicants</p>
                    <p className="text-3xl font-bold">{stats.totalApplicants}</p>
                  </div>
                  <Users className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/recruiter/interviews">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Interviews</p>
                    <p className="text-3xl font-bold">{stats.interviewsScheduled}</p>
                  </div>
                  <Video className="h-10 w-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Positions Filled</p>
                  <p className="text-3xl font-bold">{stats.positionsFilled}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={action.href}>
                    <CardHeader>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${colorClasses[action.color]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Active Jobs List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Active Job Postings</CardTitle>
                <CardDescription>Manage your active job listings</CardDescription>
              </div>
              <Link href="/dashboard/recruiter/jobs">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {jobApplicationCounts[job.id] || 0} {jobApplicationCounts[job.id] === 1 ? 'applicant' : 'applicants'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {job.views || 0} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/recruiter/jobs/${job.id}/applicants`}>
                        <Button variant="outline" size="sm">
                          View Applicants
                        </Button>
                      </Link>
                      <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">No active job postings yet</p>
                <Link href="/dashboard/recruiter/jobs/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

export default function RecruiterDashboard() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <DashboardLayout>
        <RecruiterDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
