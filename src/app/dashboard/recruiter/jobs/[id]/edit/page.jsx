'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { USER_ROLES } from '@/types';
import { Save, ArrowLeft } from 'lucide-react';
import { getJobById, updateJob } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { useJobStore } from '@/store/useJobStore';
import { jobSchema } from '@/lib/schemas';
import Link from 'next/link';

function EditJobContent() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { updateJob: updateJobInStore } = useJobStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    location: '',
    locationType: '',
    employmentType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    benefits: '',
    status: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const job = await getJobById(params.id);

        if (!job) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        // Check if current user is the recruiter who created this job
        if (job.recruiterId !== profile?.uid) {
          setError('You do not have permission to edit this job');
          setLoading(false);
          return;
        }

        // Populate form with existing data
        setFormData({
          title: job.title || '',
          description: job.description || '',
          responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
          requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
          skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
          location: job.location || '',
          locationType: job.locationType || '',
          employmentType: job.employmentType || '',
          experienceLevel: job.experienceLevel || '',
          salaryMin: job.salaryMin?.toString() || '',
          salaryMax: job.salaryMax?.toString() || '',
          benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
          status: job.status || 'draft',
        });
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && profile?.uid) {
      fetchJob();
    }
  }, [params.id, profile?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        location: formData.location,
        locationType: formData.locationType,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        currency: 'USD',
        benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
        status: formData.status,
      };

      // Validate with Zod
      jobSchema.parse(jobData);

      // Update job in Firebase
      await updateJob(params.id, jobData);

      // IMMEDIATELY update Zustand store
      updateJobInStore(params.id, jobData);

      // Redirect to jobs list
      router.push('/dashboard/recruiter/jobs');
    } catch (err) {
      if (err.name === 'ZodError') {
        setError(err.errors[0].message);
      } else {
        setError('Failed to update job. Please try again.');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/dashboard/recruiter/jobs" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard/recruiter/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Job
          </h1>
          <p className="text-gray-600">
            Update your job posting details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Update the details about the position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a comprehensive overview of the role..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum 50 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationType">Location Type *</Label>
                    <Select
                      value={formData.locationType}
                      onValueChange={(value) => setFormData({ ...formData, locationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead/Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Job Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Responsibilities & Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Responsibilities & Requirements</h3>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities *</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Enter each responsibility on a new line"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500">One per line</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Enter each requirement on a new line"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500">One per line</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills *</Label>
                  <Input
                    id="skills"
                    placeholder="React, Node.js, TypeScript, AWS, Docker"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">Comma-separated</p>
                </div>
              </div>

              {/* Compensation & Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation & Benefits</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary (USD)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      placeholder="80000"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary (USD)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      placeholder="120000"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits (Optional)</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Enter each benefit on a new line"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">One per line</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Link href="/dashboard/recruiter/jobs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <DashboardLayout>
        <EditJobContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
