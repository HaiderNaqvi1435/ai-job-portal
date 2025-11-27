'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { Send, FileText, AlertCircle } from 'lucide-react';
import { getJobById, createApplication } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { applicationSchema } from '@/lib/schemas';
import { optimizeForATS } from '@/lib/api/openai';

function ApplicationFormContent() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeUrl: '',
    portfolioUrl: '',
    linkedinUrl: '',
    additionalInfo: '',
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await getJobById(params.id);
        setJob(jobData);

        // Pre-fill resume URL if available in profile
        if (profile?.resumeUrl) {
          setFormData(prev => ({ ...prev, resumeUrl: profile.resumeUrl }));
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id, profile]);

  const handleAnalyzeATS = async () => {
    if (!formData.resumeUrl || !job) {
      setError('Please provide a resume URL first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // In a real app, you'd fetch the resume content from the URL
      // For now, we'll show a simulated score
      const resumeText = "Sample resume text"; // TODO: Fetch actual resume
      const jobDescription = job.description;

      const result = await optimizeForATS(resumeText, jobDescription);
      setAtsScore(result.atsScore);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validate form data
      const applicationData = {
        ...formData,
        jobId: params.id,
      };

      applicationSchema.parse(applicationData);

      // Create application
      await createApplication({
        ...applicationData,
        userId: user.uid,
        atsScore: atsScore || 0,
        fitScore: 0, // Will be calculated by backend
      });

      // Redirect to applications page
      router.push('/dashboard/job-seeker/applications');
    } catch (err) {
      if (err.name === 'ZodError') {
        setError(err.errors[0].message);
      } else {
        setError('Failed to submit application. Please try again.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <DashboardNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're trying to apply for doesn't exist</p>
            <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-600">
            Complete the application form below
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>
                  Fill in your information to apply for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl">Resume URL *</Label>
                    <Input
                      id="resumeUrl"
                      type="url"
                      placeholder="https://example.com/resume.pdf"
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Link to your resume (Google Drive, Dropbox, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you're a great fit for this role..."
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      rows={8}
                    />
                    <p className="text-xs text-gray-500">Optional, but recommended (min. 50 characters)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any other information you'd like to share..."
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyzeATS}
                      disabled={analyzing || !formData.resumeUrl}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {analyzing ? 'Analyzing...' : 'Check ATS Score'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Job Summary & ATS Score */}
          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-semibold">{job.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{job.employmentType?.replace('-', ' ')}</p>
                </div>
                {job.salaryMin && job.salaryMax && (
                  <div>
                    <p className="text-sm text-gray-500">Salary Range</p>
                    <p className="font-semibold">
                      ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills?.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ATS Score */}
            {atsScore !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>ATS Compatibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-5xl font-bold mb-2 ${atsScore >= 80 ? 'text-green-600' : atsScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {atsScore}
                    </div>
                    <p className="text-sm text-gray-600">out of 100</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <div
                        className={`h-2 rounded-full ${atsScore >= 80 ? 'bg-green-600' : atsScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${atsScore}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      {atsScore >= 80 && 'Excellent match! Your resume is well-optimized.'}
                      {atsScore >= 60 && atsScore < 80 && 'Good match, but could be improved.'}
                      {atsScore < 60 && 'Consider optimizing your resume for better results.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>✓ Tailor your cover letter to this specific role</li>
                  <li>✓ Highlight relevant skills and experience</li>
                  <li>✓ Proofread for spelling and grammar</li>
                  <li>✓ Use our ATS checker to optimize your resume</li>
                  <li>✓ Include quantifiable achievements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <ApplicationFormContent />
    </ProtectedRoute>
  );
}
