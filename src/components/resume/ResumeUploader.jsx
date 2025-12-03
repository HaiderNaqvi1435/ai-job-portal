'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function ResumeUploader({ onUploadComplete, existingResumeUrl, existingResumeText }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeText, setResumeText] = useState(existingResumeText || '');
  const [resumeUrl, setResumeUrl] = useState(existingResumeUrl || '');
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or DOC/DOCX file');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `resumes/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload resume');
          setUploading(false);
        },
        async () => {
          // Upload complete, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setResumeUrl(downloadURL);

          toast.success('Resume uploaded successfully!');

          if (onUploadComplete) {
            onUploadComplete({
              resumeUrl: downloadURL,
              resumeText: null,
              fileName: file.name
            });
          }

          setUploading(false);
          setFile(null);
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
      setUploading(false);
    }
  };

  const handleTextSave = () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    if (resumeText.trim().length < 100) {
      toast.error('Resume text is too short (minimum 100 characters)');
      return;
    }

    toast.success('Resume text saved successfully!');

    if (onUploadComplete) {
      onUploadComplete({
        resumeUrl: null,
        resumeText: resumeText.trim()
      });
    }
  };

  const handleUrlSave = () => {
    if (!resumeUrl.trim()) {
      toast.error('Please enter a resume URL');
      return;
    }

    // Validate URL format
    try {
      new URL(resumeUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    toast.success('Resume URL saved successfully!');

    if (onUploadComplete) {
      onUploadComplete({
        resumeUrl: resumeUrl.trim(),
        resumeText: null
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload a file, paste text, or provide a link to your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="resume-file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="resume-file" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
              </label>
            </div>

            {file && !uploading && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button onClick={handleFileUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {resumeUrl && !uploading && activeTab === 'upload' && (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">Resume uploaded successfully!</p>
              </div>
            )}
          </TabsContent>

          {/* Text Paste Tab */}
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-text">Paste Your Resume</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here..."
                rows={15}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                {resumeText.length} characters
                {resumeText.length > 0 && resumeText.length < 100 && (
                  <span className="text-orange-600 ml-2">
                    (Minimum 100 characters required)
                  </span>
                )}
              </p>
            </div>

            <Button onClick={handleTextSave} disabled={resumeText.length < 100}>
              <FileText className="h-4 w-4 mr-2" />
              Save Resume Text
            </Button>

            {existingResumeText && (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">Resume text saved!</p>
              </div>
            )}
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-url">Resume URL</Label>
              <input
                id="resume-url"
                type="url"
                placeholder="https://example.com/my-resume.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Link to your resume hosted on Google Drive, Dropbox, or your personal website
              </p>
            </div>

            <Button onClick={handleUrlSave} disabled={!resumeUrl.trim()}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Save Resume URL
            </Button>

            {existingResumeUrl && (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">Resume URL saved!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
