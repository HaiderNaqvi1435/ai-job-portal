'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import { getJobs } from '@/lib/api/firebase-helpers';
import { useJobStore } from '@/store/useJobStore';
import { JOB_STATUS } from '@/types';

export default function JobList() {
  const { jobs, setJobs } = useJobStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Fetching active jobs for landing page...');
        const activeJobs = await getJobs({ status: JOB_STATUS.ACTIVE, limit: 4 });
        console.log('Fetched active jobs:', activeJobs);

        // IMMEDIATELY update Zustand store
        setJobs(activeJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [setJobs]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Latest Job Openings
          </h2>
          <p className="text-xl text-gray-600">
            Browse through thousands of opportunities from top companies
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {jobs.slice(0, 4).map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{job.companyName || 'Company'}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {job.locationType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="capitalize">{job.employmentType?.replace('-', ' ')}</span>
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>
                          ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills?.length > 3 && (
                      <Badge variant="outline">+{job.skills.length - 3} more</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/apply`} className="flex-1">
                      <Button className="w-full">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs available at the moment.</p>
          </div>
        )}

        <div className="text-center">
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              View All Jobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
