'use client';

import { Button } from '@/components/ui/button';
import { Briefcase, User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
  const { isAuthenticated, profile } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Job Portal</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
              Find Jobs
            </Link>
            <Link href="/companies" className="text-gray-700 hover:text-gray-900 font-medium">
              Companies
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </Link>
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && profile ? (
              <Link href="/dashboard">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
