'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, ExternalLink, Eye } from 'lucide-react';

export default function ResumeViewer({ resumeUrl, resumeText, applicantName = 'Applicant' }) {
  if (!resumeUrl && !resumeText) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No resume available</p>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  const handleView = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
            <CardDescription>
              {applicantName}'s resume
            </CardDescription>
          </div>
          <Badge variant="secondary">Available</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resume URL */}
        {resumeUrl && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">Resume File</p>
                  <p className="text-xs text-blue-600 truncate">{resumeUrl}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleView} className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Resume
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        )}

        {/* Resume Text */}
        {resumeText && !resumeUrl && (
          <div className="space-y-3">
            <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {resumeText}
              </pre>
            </div>

            <Button
              onClick={() => {
                const blob = new Blob([resumeText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${applicantName.replace(/\s+/g, '_')}_resume.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Text
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
