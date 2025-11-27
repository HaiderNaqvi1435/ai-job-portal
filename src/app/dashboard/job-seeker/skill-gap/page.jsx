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
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, BookOpen, TrendingUp, Lightbulb } from 'lucide-react';
import { analyzeSkillGap } from '@/lib/api/openai';

function SkillGapAnalysisContent() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const analysis = await analyzeSkillGap(resumeText, jobDescription);
      setResult(analysis);
    } catch (err) {
      setError('Failed to analyze skill gap. Please try again.');
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

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'stable') return <span className="text-blue-600">→</span>;
    return <span className="text-red-600">↓</span>;
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skill Gap Analysis
          </h1>
          <p className="text-gray-600">
            Identify missing skills and get personalized learning recommendations
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

            <Button onClick={handleAnalyze} disabled={loading} className="w-full" size="lg">
              {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Fit Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Job Fit Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="transform -rotate-90 w-40 h-40">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.fitScore / 100)}`}
                            className={getScoreColor(result.fitScore)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-bold ${getScoreColor(result.fitScore)}`}>
                            {result.fitScore}
                          </span>
                          <span className="text-sm text-gray-600">out of 100</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Found */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Skills You Have ({result.skillsFound?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Skills from the job description that you possess
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsFound?.map((skill, index) => (
                        <Badge key={index} className="bg-green-100 text-green-700 hover:bg-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      Missing Skills ({result.skillsMissing?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Skills you need to learn for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsMissing?.map((skill, index) => (
                        <Badge key={index} variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weak Skills */}
                {result.weakSkills && result.weakSkills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-yellow-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Skills to Improve ({result.weakSkills.length})
                      </CardTitle>
                      <CardDescription>
                        Skills you have but should strengthen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.weakSkills.map((skill, index) => (
                          <Badge key={index} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Courses */}
                {result.recommendedCourses && result.recommendedCourses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-600">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Recommended Learning Path
                      </CardTitle>
                      <CardDescription>
                        Courses to help you bridge the skill gap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.recommendedCourses.map((course, index) => (
                          <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                            <div className="font-semibold text-gray-900">{course.skill}</div>
                            <div className="text-sm text-gray-700 mt-1">{course.course}</div>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                              <Badge variant="outline">{course.platform}</Badge>
                              <span>{course.estimatedTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Demand */}
                {result.marketDemand && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Market Demand Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Demand Score</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {result.marketDemand.score}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full"
                              style={{ width: `${(result.marketDemand.score / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Market Trend</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(result.marketDemand.trend)}
                            <span className="font-semibold capitalize">
                              {result.marketDemand.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Improvement Tips */}
                {result.improvementTips && result.improvementTips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-purple-600">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Improvement Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.improvementTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mr-2 mt-1 text-purple-600 flex-shrink-0" />
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!result && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Paste your resume and job description to analyze skill gaps
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

export default function SkillGapAnalysisPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <SkillGapAnalysisContent />
    </ProtectedRoute>
  );
}
