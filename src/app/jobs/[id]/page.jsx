'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  Bookmark,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { getJobById } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/types';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(params.id);
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const handleApply = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${params.id}/apply`);
    } else if (profile?.role !== USER_ROLES.JOB_SEEKER) {
      alert('Only job seekers can apply to jobs');
    } else {
      router.push(`/jobs/${params.id}/apply`);
    }
  };

  const handleSave = () => {
    if (!user) {
      router.push('/auth/login');
    } else {
      // TODO: Implement save job functionality
      alert('Save job feature coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist</p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="capitalize">
                      {job.locationType}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {job.employmentType?.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {job.experienceLevel} Level
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Job Type</p>
                    <p className="font-medium capitalize">{job.employmentType?.replace('-', ' ')}</p>
                  </div>
                </div>
                {job.salaryMin && job.salaryMax && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Salary</p>
                      <p className="font-medium">
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Posted</p>
                    <p className="font-medium">
                      {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleApply} size="lg" className="flex-1">
                  Apply Now
                </Button>
                <Button onClick={handleSave} variant="outline" size="lg">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Apply Button (Bottom) */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Interested in this position? Apply now!
                </p>
                <Button onClick={handleApply} size="lg" className="w-full md:w-auto md:px-12">
                  Apply for this Position
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
