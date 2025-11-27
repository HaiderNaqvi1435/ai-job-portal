'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { Plus, Search, Eye, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getRecruiterJobs, deleteJob } from '@/lib/api/firebase-helpers';

function JobManagementContent() {
  const { profile } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      if (profile?.uid) {
        try {
          const recruiterJobs = await getRecruiterJobs(profile.uid);
          setJobs(recruiterJobs);
          setFilteredJobs(recruiterJobs);
        } catch (error) {
          console.error('Error fetching jobs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJobs();
  }, [profile]);

  useEffect(() => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, statusFilter, jobs]);

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Management
            </h1>
            <p className="text-gray-600">
              Manage all your job postings
            </p>
          </div>
          <Link href="/dashboard/recruiter/jobs/create">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </CardContent>
          </Card>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant={job.status === 'active' ? 'default' : job.status === 'draft' ? 'secondary' : 'outline'}>
                          {job.status}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="text-sm font-medium">{job.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Type</p>
                          <p className="text-sm font-medium capitalize">{job.employmentType?.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Salary</p>
                          <p className="text-sm font-medium">
                            ${job.salaryMin?.toLocaleString() || 'N/A'} - ${job.salaryMax?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Posted</p>
                          <p className="text-sm font-medium">
                            {new Date(job.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills?.length > 5 && (
                          <Badge variant="outline">+{job.skills.length - 5} more</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          0 applicants
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          0 views
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/jobs/${job.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/recruiter/jobs/${job.id}/applicants`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Applicants
                        </Button>
                      </Link>
                      <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' ? (
                  <>
                    <Search className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-gray-600">No jobs found matching your filters</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Plus className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No job postings yet</p>
                    <Link href="/dashboard/recruiter/jobs/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function JobManagementPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <JobManagementContent />
    </ProtectedRoute>
  );
}
