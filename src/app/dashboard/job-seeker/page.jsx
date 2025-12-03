'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { USER_ROLES, APPLICATION_STATUS } from '@/types';
import {
  FileText,
  Target,
  BarChart3,
  Briefcase,
  DollarSign,
  Clock,
  Video,
  MapPin,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getUserApplications } from '@/lib/api/firebase-helpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function JobSeekerContent() {
  const { profile, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    profileViews: 0,
    savedJobs: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        try {
          // Fetch user applications
          const userApps = await getUserApplications(user.uid);
          setApplications(userApps);

          // Calculate stats
          const interviews = userApps.filter(
            app => app.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED
          ).length;

          setStats({
            totalApplications: userApps.length,
            interviews,
            profileViews: profile?.views || 0,
            savedJobs: 0, // TODO: Implement saved jobs feature
          });
        } catch (error) {
          console.error('Error fetching applications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user, profile]);

  const aiTools = [
    {
      icon: FileText,
      title: 'Resume Analyzer',
      description: 'Get AI-powered feedback on your resume',
      href: '/dashboard/job-seeker/resume-analyzer',
      color: 'blue',
    },
    {
      icon: Target,
      title: 'ATS Optimization',
      description: 'Optimize your resume for ATS systems',
      href: '/dashboard/job-seeker/ats-optimization',
      color: 'purple',
    },
    {
      icon: BarChart3,
      title: 'Skill Gap Analysis',
      description: 'Identify and improve missing skills',
      href: '/dashboard/job-seeker/skill-gap',
      color: 'green',
    },
    {
      icon: DollarSign,
      title: 'Salary Insights',
      description: 'Get data-driven salary expectations',
      href: '/dashboard/job-seeker/salary-insights',
      color: 'yellow',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="p-8">
      {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600">
            Track your applications and use our AI tools to boost your job search
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/job-seeker/applications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/job-seeker/interviews">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Interviews</p>
                    <p className="text-2xl font-bold">{stats.interviews}</p>
                  </div>
                  <Video className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold">{stats.profileViews}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saved Jobs</p>
                  <p className="text-2xl font-bold">{stats.savedJobs}</p>
                </div>
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tools Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${colorClasses[tool.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={tool.href}>
                      <Button className="w-full">Use Tool</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Track your job applications</CardDescription>
              </div>
              <Link href="/dashboard/job-seeker/applications">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{app.jobTitle}</h3>
                        <Badge variant={
                          app.status === APPLICATION_STATUS.SHORTLISTED ? 'default' :
                          app.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'default' :
                          'secondary'
                        }>
                          {app.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {app.companyName}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {app.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(app.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/jobs/${app.jobId}`}>
                      <Button variant="outline" size="sm">
                        View Job
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No applications yet</p>
                <Link href="/jobs">
                  <Button className="mt-4">Browse Jobs</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

export default function JobSeekerDashboard() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <DashboardLayout>
        <JobSeekerContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
