'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ScheduleInterviewDialog from '@/components/interview/ScheduleInterviewDialog';
import { USER_ROLES } from '@/types';
import { Calendar, Mail, Phone, FileText, Video, User } from 'lucide-react';
import { getJobApplications, getJobById, updateApplication } from '@/lib/api/firebase-helpers';
import { useApplicationStore } from '@/store/useApplicationStore';
import Link from 'next/link';

function ApplicantsContent() {
  const params = useParams();
  const jobId = params.id;
  const { applications, setApplications, updateApplication: updateApplicationInStore } = useApplicationStore();
  const [job, setJob] = useState(null);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, applicationsData] = await Promise.all([
          getJobById(jobId),
          getJobApplications(jobId)
        ]);

        setJob(jobData);

        // IMMEDIATELY update Zustand store
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, setApplications]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplication(applicationId, { status: newStatus });

      // IMMEDIATELY update Zustand store
      updateApplicationInStore(applicationId, { status: newStatus });
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update status');
    }
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setScheduleDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
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

  if (!job) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Job not found</p>
            <Link href="/dashboard/recruiter/jobs">
              <Button className="mt-4">Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/recruiter/jobs">
          <Button variant="ghost" className="mb-4">
            ← Back to Jobs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Applicants for {job.title}
        </h1>
        <p className="text-gray-600">
          {filteredApplications.length} {filteredApplications.length === 1 ? 'applicant' : 'applicants'}
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{application.name}</CardTitle>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Applied on {new Date(application.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{application.email}</p>
                    </div>
                  </div>

                  {application.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{application.phone}</p>
                      </div>
                    </div>
                  )}

                  {application.experience && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-sm text-gray-600">{application.experience}</p>
                      </div>
                    </div>
                  )}
                </div>

                {application.coverLetter && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Cover Letter:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg line-clamp-3">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {application.resumeUrl && (
                    <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleInterview(application)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>

                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusChange(application.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
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
              {statusFilter === 'all' ? 'No applicants yet' : `No ${statusFilter} applicants`}
            </p>
            {statusFilter !== 'all' && (
              <Button variant="outline" onClick={() => setStatusFilter('all')}>
                View All Applicants
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Interview Dialog */}
      {selectedApplication && job && (
        <ScheduleInterviewDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          applicationData={selectedApplication}
          jobData={job}
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
