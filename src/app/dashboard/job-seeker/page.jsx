'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import {
  FileText,
  Target,
  BarChart3,
  Briefcase,
  DollarSign,
  Clock,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

function JobSeekerContent() {
  const { profile } = useAuthStore();

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
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <p className="text-2xl font-bold">0</p>
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
                    <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Track your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No applications yet</p>
              <Link href="/jobs">
                <Button className="mt-4">Browse Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JobSeekerDashboard() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <JobSeekerContent />
    </ProtectedRoute>
  );
}
