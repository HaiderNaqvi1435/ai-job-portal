'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { Target, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { optimizeForATS } from '@/lib/api/openai';

function ATSOptimizationContent() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const optimization = await optimizeForATS(resumeText, jobDescription);
      setResult(optimization);
    } catch (err) {
      setError('Failed to optimize resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ATS Optimization
          </h1>
          <p className="text-gray-600">
            Optimize your resume to pass Applicant Tracking Systems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Resume</CardTitle>
                <CardDescription>Paste your current resume text</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste the target job description</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleOptimize} disabled={loading} className="w-full" size="lg">
              {loading ? 'Analyzing...' : 'Optimize for ATS'}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && (
              <>
                {/* ATS Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      ATS Compatibility Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(result.atsScore)}`}>
                        {result.atsScore}
                      </div>
                      <p className="text-gray-600 mt-2">out of 100</p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getScoreBgColor(result.atsScore)} transition-all duration-500`}
                          style={{ width: `${result.atsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Matched Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Matched Keywords ({result.matchedKeywords?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Keywords found in your resume that match the job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords?.map((keyword, index) => (
                        <Badge key={index} className="bg-green-100 text-green-700 hover:bg-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      Missing Keywords ({result.missingKeywords?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Important keywords you should add to your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords?.map((keyword, index) => (
                        <Badge key={index} variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Density */}
                {result.keywordDensity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Keyword Density
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current: {result.keywordDensity.current}%</span>
                            <span className="text-gray-600">
                              Recommended: {result.keywordDensity.recommended}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${result.keywordDensity.current}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations?.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 mr-2 mt-1 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Optimized Resume */}
                {result.optimizedResume && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ATS-Optimized Version</CardTitle>
                      <CardDescription>
                        Your resume optimized for Applicant Tracking Systems
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {result.optimizedResume}
                        </pre>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        Copy Optimized Resume
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Paste your resume and job description, then click "Optimize for ATS"
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

export default function ATSOptimizationPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <ATSOptimizationContent />
    </ProtectedRoute>
  );
}
