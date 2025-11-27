'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter } from 'lucide-react';
import Link from 'next/link';
import { getJobs } from '@/lib/api/firebase-helpers';
import { JOB_STATUS } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const activeJobs = await getJobs({ status: JOB_STATUS.ACTIVE });
        setJobs(activeJobs);
        setFilteredJobs(activeJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        {/* Search Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Dream Job</h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Job title, skills, or keywords..."
                  className="pl-10 h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Location"
                  className="pl-10 h-12"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Button size="lg" className="h-12 px-8">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading...' : `${filteredJobs.length} Jobs Found`}
            </h2>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {job.title}
                            </h3>
                          </Link>
                          <Badge variant="secondary" className="capitalize ml-4">
                            {job.locationType}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{job.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2" />
                            <span className="text-sm capitalize">
                              {job.employmentType?.replace('-', ' ')}
                            </span>
                          </div>
                          {job.salaryMin && job.salaryMax && (
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.skills?.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills?.length > 5 && (
                            <Badge variant="outline">+{job.skills.length - 5} more</Badge>
                          )}
                        </div>
                      </div>

                      <div className="ml-6">
                        <Link href={`/jobs/${job.id}`}>
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
