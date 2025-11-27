'use client';

import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Job Portal</span>
            </div>
            <p className="text-sm">
              Revolutionizing recruitment with AI-powered tools for job seekers and employers.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="hover:text-white">Browse Jobs</Link>
              </li>
              <li>
                <Link href="/resume-analyzer" className="hover:text-white">Resume Analyzer</Link>
              </li>
              <li>
                <Link href="/skill-gap" className="hover:text-white">Skill Gap Analysis</Link>
              </li>
              <li>
                <Link href="/salary-insights" className="hover:text-white">Salary Insights</Link>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Recruiters</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/post-job" className="hover:text-white">Post a Job</Link>
              </li>
              <li>
                <Link href="/ai-job-generator" className="hover:text-white">AI Job Generator</Link>
              </li>
              <li>
                <Link href="/applicant-tracking" className="hover:text-white">Applicant Tracking</Link>
              </li>
              <li>
                <Link href="/video-interviews" className="hover:text-white">Video Interviews</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white">Companies</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">Contact</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} AI Job Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
