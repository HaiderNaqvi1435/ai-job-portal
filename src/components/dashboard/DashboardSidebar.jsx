'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/types';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  FileText,
  Target,
  BarChart3,
  DollarSign,
  Plus,
  Sparkles,
  ClipboardList,
  Upload,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const recruiterLinks = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard/recruiter',
    },
    {
      icon: Briefcase,
      label: 'Job Management',
      href: '/dashboard/recruiter/jobs',
    },
    {
      icon: Plus,
      label: 'Post New Job',
      href: '/dashboard/recruiter/jobs/create',
    },
    {
      icon: Sparkles,
      label: 'AI Job Generator',
      href: '/dashboard/recruiter/generate-job',
    },
    {
      icon: Users,
      label: 'Applicants',
      href: '/dashboard/recruiter/applicants',
    },
    {
      icon: Video,
      label: 'Interviews',
      href: '/dashboard/recruiter/interviews',
    },
  ];

  const jobSeekerLinks = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard/job-seeker',
    },
    {
      icon: Search,
      label: 'Browse Jobs',
      href: '/jobs',
    },
    {
      icon: ClipboardList,
      label: 'My Applications',
      href: '/dashboard/job-seeker/applications',
    },
    {
      icon: Video,
      label: 'My Interviews',
      href: '/dashboard/job-seeker/interviews',
    },
    {
      icon: Upload,
      label: 'Resume Management',
      href: '/dashboard/resume',
    },
    {
      icon: FileText,
      label: 'Resume Analyzer',
      href: '/dashboard/job-seeker/resume-analyzer',
    },
    {
      icon: Target,
      label: 'ATS Optimization',
      href: '/dashboard/job-seeker/ats-optimization',
    },
    {
      icon: BarChart3,
      label: 'Skill Gap Analysis',
      href: '/dashboard/job-seeker/skill-gap',
    },
    {
      icon: DollarSign,
      label: 'Salary Insights',
      href: '/dashboard/job-seeker/salary-insights',
    },
  ];

  const links = profile?.role === USER_ROLES.RECRUITER ? recruiterLinks : jobSeekerLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
