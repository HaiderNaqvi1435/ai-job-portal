'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumeViewer from '@/components/resume/ResumeViewer';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/types';
import { FileText, Sparkles, Target } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

function ResumeManagementContent() {
  const { profile, setProfile } = useAuthStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(null);

  const handleResumeUpload = async (resumeData) => {
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        resumeUrl: resumeData.resumeUrl || profile.resumeUrl || '',
        resumeText: resumeData.resumeText || profile.resumeText || '',
        resumeFileName: resumeData.fileName || '',
        resumeUpdatedAt: new Date(),
      });

      // Update local state
      setProfile({
        ...profile,
        resumeUrl: resumeData.resumeUrl || profile.resumeUrl,
        resumeText: resumeData.resumeText || profile.resumeText,
        resumeFileName: resumeData.fileName,
      });

      toast.success('Resume saved to your profile!');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
  };

  const handleAnalyzeATS = async () => {
    setAnalyzing(true);

    try {
      // Simulate ATS analysis (in production, this would call your OpenAI API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a simulated score
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      setAtsScore(score);

      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const hasResume = profile?.resumeUrl || profile?.resumeText;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Management</h1>
        <p className="text-gray-600">
          Upload, manage, and optimize your resume for ATS systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Uploader */}
          <ResumeUploader
            onUploadComplete={handleResumeUpload}
            existingResumeUrl={profile?.resumeUrl}
            existingResumeText={profile?.resumeText}
          />

          {/* Current Resume */}
          {hasResume && (
            <Card>
              <CardHeader>
                <CardTitle>Current Resume</CardTitle>
                <CardDescription>
                  Your currently saved resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeViewer
                  resumeUrl={profile?.resumeUrl}
                  resumeText={profile?.resumeText}
                  applicantName={profile?.name}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ATS Optimization Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                ATS Optimization
              </CardTitle>
              <CardDescription>
                Optimize your resume for Applicant Tracking Systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {atsScore !== null && (
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className={`text-5xl font-bold mb-2 ${
                    atsScore >= 80 ? 'text-green-600' :
                    atsScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {atsScore}
                  </div>
                  <p className="text-sm text-gray-600">ATS Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className={`h-2 rounded-full ${
                        atsScore >= 80 ? 'bg-green-600' :
                        atsScore >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${atsScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {atsScore >= 80 && 'Excellent! Your resume is well-optimized.'}
                    {atsScore >= 60 && atsScore < 80 && 'Good, but could be improved.'}
                    {atsScore < 60 && 'Needs improvement for better ATS compatibility.'}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAnalyzeATS}
                disabled={!hasResume || analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze ATS Score
                  </>
                )}
              </Button>

              {!hasResume && (
                <p className="text-xs text-gray-500 text-center">
                  Upload a resume first to analyze
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resume Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Use standard section headers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Include relevant keywords</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Keep formatting simple</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Save as PDF when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Avoid images and graphics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ResumeManagementPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
      <DashboardLayout>
        <ResumeManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
