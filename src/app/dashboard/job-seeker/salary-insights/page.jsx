'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { USER_ROLES } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, Minus, Building2, Lightbulb } from 'lucide-react';
import { getSalaryInsights } from '@/lib/api/openai';

function SalaryInsightsContent() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!formData.jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const insights = await getSalaryInsights(
        formData.jobTitle,
        formData.location || 'United States',
        formData.skills
      );
      setResult(insights);
    } catch (err) {
      setError('Failed to get salary insights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend === 'stable') return <Minus className="h-5 w-5 text-blue-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'increasing') return 'text-green-600';
    if (trend === 'stable') return 'text-blue-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Salary Insights
          </h1>
          <p className="text-gray-600">
            Get data-driven salary expectations based on your skills and location
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>Enter details to get salary insights</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., React, Node.js, AWS"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Analyzing...' : 'Get Salary Insights'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {result && (
              <>
                {/* Salary Range */}
                {result.salaryRange && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Estimated Salary Range
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Minimum</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(result.salaryRange.min)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-600">
                          <div className="text-sm text-blue-600 mb-1">Median</div>
                          <div className="text-3xl font-bold text-blue-600">
                            {formatCurrency(result.salaryRange.median)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Maximum</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(result.salaryRange.max)}
                          </div>
                        </div>
                      </div>
                      <div className="relative h-4 bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 rounded-full">
                        <div
                          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white"
                          style={{ left: '50%' }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Trend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getTrendIcon(result.marketTrend)}
                        <span className="ml-2">Market Trend</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-3xl font-bold capitalize ${getTrendColor(result.marketTrend)}`}>
                          {result.marketTrend}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {result.marketTrend === 'increasing' && 'Salaries are trending upward'}
                          {result.marketTrend === 'stable' && 'Salaries are remaining stable'}
                          {result.marketTrend === 'decreasing' && 'Salaries are trending downward'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Demand Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="transform -rotate-90 w-32 h-32">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="10"
                              fill="transparent"
                              className="text-gray-200"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="currentColor"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.skillDemandScore / 10)}`}
                              className="text-blue-600"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-blue-600">
                              {result.skillDemandScore}
                            </span>
                            <span className="text-sm text-gray-600">out of 10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Experience Level Comparison */}
                {result.comparison && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Salary by Experience Level</CardTitle>
                      <CardDescription>
                        Average salaries across different experience levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { level: 'Entry Level', amount: result.comparison.entryLevel, color: 'bg-green-600' },
                          { level: 'Mid Level', amount: result.comparison.midLevel, color: 'bg-blue-600' },
                          { level: 'Senior Level', amount: result.comparison.seniorLevel, color: 'bg-purple-600' }
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{item.level}</span>
                              <span className="text-lg font-bold">{formatCurrency(item.amount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full ${item.color}`}
                                style={{ width: `${(item.amount / result.comparison.seniorLevel) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Paying Companies */}
                {result.topPayingCompanies && result.topPayingCompanies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Top Paying Companies
                      </CardTitle>
                      <CardDescription>
                        Companies known for competitive salaries in this role
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.topPayingCompanies.map((company, index) => (
                          <Badge key={index} variant="secondary" className="text-base py-2 px-4">
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                {result.insights && result.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <DollarSign className="h-4 w-4 mr-2 mt-1 text-blue-600 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-purple-600">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mr-2 mt-1 text-purple-600 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
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
                  <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Enter job information to get salary insights
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

export default function SalaryInsightsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <SalaryInsightsContent />
    </ProtectedRoute>
  );
}
