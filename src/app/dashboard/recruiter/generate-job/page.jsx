'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { Sparkles, Save, Send } from 'lucide-react';
import { generateJobDescription } from '@/lib/api/openai';
import { createJob } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { aiJobGenerationSchema } from '@/lib/schemas';

function AIJobGeneratorContent() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyIndustry: '',
    experienceLevel: '',
    keySkills: '',
    location: '',
    employmentType: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      // Validate form data
      aiJobGenerationSchema.parse(formData);

      // Generate job description
      const generated = await generateJobDescription(formData);
      setResult(generated);
    } catch (err) {
      if (err.name === 'ZodError') {
        setError(err.errors[0].message);
      } else {
        setError('Failed to generate job description. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!result || !profile) return;

    setSaving(true);
    try {
      await createJob(profile.uid, {
        title: result.title,
        description: result.description,
        responsibilities: result.responsibilities || [],
        requirements: result.requirements || [],
        skills: result.skills || [],
        location: formData.location,
        locationType: 'onsite',
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: result.salaryRange?.min || 0,
        salaryMax: result.salaryRange?.max || 0,
        currency: result.salaryRange?.currency || 'USD',
        benefits: result.benefits || [],
        status: 'draft',
      });

      router.push('/dashboard/recruiter/jobs');
    } catch (error) {
      setError('Failed to save job. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!result || !profile) return;

    setSaving(true);
    try {
      await createJob(profile.uid, {
        title: result.title,
        description: result.description,
        responsibilities: result.responsibilities || [],
        requirements: result.requirements || [],
        skills: result.skills || [],
        location: formData.location,
        locationType: 'onsite',
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: result.salaryRange?.min || 0,
        salaryMax: result.salaryRange?.max || 0,
        currency: result.salaryRange?.currency || 'USD',
        benefits: result.benefits || [],
        status: 'active',
      });

      router.push('/dashboard/recruiter/jobs');
    } catch (error) {
      setError('Failed to publish job. Please try again.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Sparkles className="h-8 w-8 mr-2 text-purple-600" />
            AI Job Description Generator
          </h1>
          <p className="text-gray-600">
            Generate professional, ATS-friendly job descriptions with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>
                Provide details and let AI generate the complete job description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Industry *</Label>
                  <Input
                    id="companyIndustry"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={formData.companyIndustry}
                    onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keySkills">Key Skills *</Label>
                  <Input
                    id="keySkills"
                    placeholder="e.g., React, Node.js, Python, AWS"
                    value={formData.keySkills}
                    onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">Comma-separated list</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Job Description'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Output */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{result.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge>{formData.experienceLevel}</Badge>
                      <Badge variant="outline">{formData.employmentType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {result.description}
                      </p>
                    </div>

                    {/* Responsibilities */}
                    {result.responsibilities && result.responsibilities.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Responsibilities</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {result.responsibilities.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirements */}
                    {result.requirements && result.requirements.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Requirements</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {result.requirements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills */}
                    {result.skills && result.skills.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {result.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {result.benefits && result.benefits.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Benefits</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {result.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Salary Range */}
                    {result.salaryRange && (
                      <div>
                        <h3 className="font-semibold mb-2">Salary Range</h3>
                        <p className="text-lg font-bold text-green-600">
                          ${result.salaryRange.min.toLocaleString()} - ${result.salaryRange.max.toLocaleString()} {result.salaryRange.currency}
                        </p>
                      </div>
                    )}

                    {/* Qualifications */}
                    {result.qualifications && result.qualifications.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Qualifications</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {result.qualifications.map((qual, index) => (
                            <li key={index}>{qual}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveAsDraft}
                        disabled={saving}
                        variant="outline"
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save as Draft
                      </Button>
                      <Button
                        onClick={handlePublish}
                        disabled={saving}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Fill out the form and click "Generate Job Description"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIJobGeneratorPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <AIJobGeneratorContent />
    </ProtectedRoute>
  );
}
