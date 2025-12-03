'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ScheduleInterviewDialog from '@/components/interview/ScheduleInterviewDialog';
import ResumeViewer from '@/components/resume/ResumeViewer';
import { USER_ROLES, APPLICATION_STATUS } from '@/types';
import { Search, Mail, Phone, FileText, Video, User, Calendar, Briefcase, Filter } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateApplication } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from 'sonner';
import Link from 'next/link';

function ApplicantsContent() {
  const { profile } = useAuthStore();
  const { applications, setApplications, updateApplication: updateApplicationInStore } = useApplicationStore();
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch recruiter's jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('recruiterId', '==', profile.uid)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);

        // Fetch all applications for these jobs
        const jobIds = jobsData.map(job => job.id);
        if (jobIds.length === 0) {
          setApplications([]);
          setFilteredApplications([]);
          setLoading(false);
          return;
        }

        // Fetch applications in batches (Firebase 'in' query has limit of 10)
        let applicationsData = [];
        const batchSize = 10;
        for (let i = 0; i < jobIds.length; i += batchSize) {
          const batchJobIds = jobIds.slice(i, i + batchSize);
          const applicationsQuery = query(
            collection(db, 'applications'),
            where('jobId', 'in', batchJobIds)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          const batchData = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          applicationsData = [...applicationsData, ...batchData];
        }

        // Sort in memory by submission date
        applicationsData.sort((a, b) => {
          const aTime = a.submittedAt?.seconds || 0;
          const bTime = b.submittedAt?.seconds || 0;
          return bTime - aTime;
        });

        // Enrich with job titles for applications that don't have them
        applicationsData = applicationsData.map(app => {
          const job = jobsData.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: app.jobTitle || job?.title || 'Unknown Job',
            companyName: app.companyName || job?.companyName || 'Company',
            location: app.location || job?.location || 'Location'
          };
        });

        // IMMEDIATELY update Zustand store
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.uid, setApplications]);

  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by job
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId === jobFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, jobFilter, applications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplication(applicationId, { status: newStatus });

      // IMMEDIATELY update Zustand store
      updateApplicationInStore(applicationId, { status: newStatus });

      toast.success('Application status updated');
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setScheduleDialogOpen(true);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case APPLICATION_STATUS.HIRED:
        return 'bg-green-100 text-green-800';
      case APPLICATION_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      case APPLICATION_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case APPLICATION_STATUS.REVIEWED:
        return 'bg-blue-100 text-blue-800';
      case APPLICATION_STATUS.SHORTLISTED:
        return 'bg-purple-100 text-purple-800';
      case APPLICATION_STATUS.INTERVIEW_SCHEDULED:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Applicants
        </h1>
        <p className="text-gray-600">
          Manage applications across all your job postings
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={APPLICATION_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={APPLICATION_STATUS.REVIEWED}>Reviewed</SelectItem>
                <SelectItem value={APPLICATION_STATUS.SHORTLISTED}>Shortlisted</SelectItem>
                <SelectItem value={APPLICATION_STATUS.INTERVIEW_SCHEDULED}>Interview Scheduled</SelectItem>
                <SelectItem value={APPLICATION_STATUS.HIRED}>Hired</SelectItem>
                <SelectItem value={APPLICATION_STATUS.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {applications.filter(app => app.status === APPLICATION_STATUS.PENDING).length}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {applications.filter(app => app.status === APPLICATION_STATUS.SHORTLISTED).length}
              </p>
              <p className="text-sm text-gray-600">Shortlisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {applications.filter(app => app.status === APPLICATION_STATUS.HIRED).length}
              </p>
              <p className="text-sm text-gray-600">Hired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{application.name}</h3>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status?.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {application.jobTitle}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(application.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{application.email}</span>
                      </div>
                      {application.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{application.phone}</span>
                        </div>
                      )}
                    </div>

                    {application.coverLetter && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg line-clamp-2 mb-4">
                        {application.coverLetter}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {application.resumeUrl && (
                      <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleInterview(application)}
                      disabled={application.status === APPLICATION_STATUS.REJECTED}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Interview
                    </Button>
                    <Select
                      value={application.status}
                      onValueChange={(value) => handleStatusChange(application.id, value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={APPLICATION_STATUS.PENDING}>Pending</SelectItem>
                        <SelectItem value={APPLICATION_STATUS.REVIEWED}>Reviewed</SelectItem>
                        <SelectItem value={APPLICATION_STATUS.SHORTLISTED}>Shortlisted</SelectItem>
                        <SelectItem value={APPLICATION_STATUS.INTERVIEW_SCHEDULED}>Interview Scheduled</SelectItem>
                        <SelectItem value={APPLICATION_STATUS.HIRED}>Hired</SelectItem>
                        <SelectItem value={APPLICATION_STATUS.REJECTED}>Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
                ? 'No applicants found matching your filters'
                : 'No applications received yet'}
            </p>
            {(searchTerm || statusFilter !== 'all' || jobFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setJobFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
            {!searchTerm && statusFilter === 'all' && jobFilter === 'all' && (
              <Link href="/dashboard/recruiter/jobs/create">
                <Button>Post a Job</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedApplication.name}</DialogTitle>
              <DialogDescription>
                Application for {selectedApplication.jobTitle}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{selectedApplication.email}</span>
                  </div>
                  {selectedApplication.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedApplication.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.experience && (
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <p className="text-sm text-gray-600">{selectedApplication.experience}</p>
                </div>
              )}

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Application Status</h4>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status?.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Submitted</h4>
                <p className="text-sm text-gray-600">
                  {new Date(selectedApplication.submittedAt?.seconds * 1000 || Date.now()).toLocaleString()}
                </p>
              </div>

              {/* Resume Viewer */}
              {(selectedApplication.resumeUrl || selectedApplication.resumeText) && (
                <div>
                  <h4 className="font-semibold mb-3">Resume</h4>
                  <ResumeViewer
                    resumeUrl={selectedApplication.resumeUrl}
                    resumeText={selectedApplication.resumeText}
                    applicantName={selectedApplication.name}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    handleScheduleInterview(selectedApplication);
                  }}
                  className="flex-1"
                  disabled={selectedApplication.status === APPLICATION_STATUS.REJECTED}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Interview Dialog */}
      {selectedApplication && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          applicationData={selectedApplication}
          jobData={jobs.find(job => job.id === selectedApplication.jobId)}
        />
      )}
    </div>
  );
}

export default function ApplicantsPage() {
  return (
    <ProtectedRoute allowedRoles={[USER_ROLES.RECRUITER]}>
      <DashboardLayout>
        <ApplicantsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
