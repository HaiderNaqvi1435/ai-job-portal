'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock data - will be replaced with real data from Firebase
const mockJobs = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    salaryMin: 120000,
    salaryMax: 180000,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    postedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovate Solutions',
    location: 'Remote',
    locationType: 'remote',
    employmentType: 'full-time',
    salaryMin: 100000,
    salaryMax: 150000,
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    postedAt: '1 day ago',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    locationType: 'onsite',
    employmentType: 'full-time',
    salaryMin: 80000,
    salaryMax: 120000,
    skills: ['Figma', 'Adobe XD', 'User Research'],
    postedAt: '3 days ago',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Analytics Corp',
    location: 'Boston, MA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    salaryMin: 110000,
    salaryMax: 160000,
    skills: ['Python', 'Machine Learning', 'SQL'],
    postedAt: '1 week ago',
  },
];

export default function JobList() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mockJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 font-medium">{job.company}</p>
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
                    <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{job.postedAt}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="outline">+{job.skills.length - 3} more</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="flex-1">
                    <Button className="w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
