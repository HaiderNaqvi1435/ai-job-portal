'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { Save, Send, Sparkles } from 'lucide-react';
import { createJob } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { useJobStore } from '@/store/useJobStore';
import { jobSchema } from '@/lib/schemas';
import Link from 'next/link';

function CreateJobContent() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { addJob } = useJobStore();
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (status) => {
    setError('');
    setLoading(true);

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
        status,
      };

      // Validate with Zod
      jobSchema.parse(jobData);

      // Create job in Firebase
      const newJob = await createJob(profile.uid, jobData);

      // IMMEDIATELY update Zustand store
      addJob(newJob);

      // Redirect to jobs list
      router.push('/dashboard/recruiter/jobs');
    } catch (err) {
      if (err.name === 'ZodError') {
        setError(err.errors[0].message);
      } else {
        setError('Failed to create job. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Post New Job
              </h1>
              <p className="text-gray-600">
                Create a detailed job posting to attract the right candidates
              </p>
            </div>
            <Link href="/dashboard/recruiter/generate-job">
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Use AI Generator
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Fill in the details about the position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
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
              </div>

              {/* Responsibilities & Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Responsibilities & Requirements</h3>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities *</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Enter each responsibility on a new line&#10;- Lead development of new features&#10;- Mentor junior developers&#10;- Conduct code reviews"
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
                    placeholder="Enter each requirement on a new line&#10;- 5+ years of experience&#10;- Strong JavaScript skills&#10;- Bachelor's degree in CS"
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
                    placeholder="Enter each benefit on a new line&#10;- Health insurance&#10;- 401(k) matching&#10;- Flexible hours"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">One per line</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit('active')}
                  disabled={loading}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Publishing...' : 'Publish Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <CreateJobContent />
    </ProtectedRoute>
  );
}
