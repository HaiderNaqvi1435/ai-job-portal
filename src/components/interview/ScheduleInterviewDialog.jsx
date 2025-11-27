'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock } from 'lucide-react';
import { createInterview } from '@/lib/api/firebase-helpers';
import { useAuthStore } from '@/store/useAuthStore';
import { useInterviewStore } from '@/store/useInterviewStore';
import { Timestamp } from 'firebase/firestore';

export default function ScheduleInterviewDialog({ open, onOpenChange, applicationData, jobData }) {
  const { profile } = useAuthStore();
  const { addInterview } = useInterviewStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.date || !formData.time) {
        setError('Please select both date and time');
        return;
      }

      // Combine date and time into a single timestamp
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      if (scheduledDateTime < new Date()) {
        setError('Please select a future date and time');
        return;
      }

      const interviewData = {
        jobId: jobData.id,
        jobTitle: jobData.title,
        recruiterId: profile.uid,
        recruiterName: profile.name,
        recruiterEmail: profile.email,
        candidateId: applicationData.userId,
        candidateName: applicationData.name,
        candidateEmail: applicationData.email,
        applicationId: applicationData.id,
        scheduledAt: Timestamp.fromDate(scheduledDateTime),
        duration: parseInt(formData.duration),
        notes: formData.notes,
        status: 'scheduled',
        roomUrl: '', // Will be generated when interview starts
      };

      // Create interview in Firebase
      const newInterview = await createInterview(interviewData);

      // IMMEDIATELY update Zustand store
      addInterview(newInterview);

      // Close dialog and reset form
      onOpenChange(false);
      setFormData({
        date: '',
        time: '',
        duration: '60',
        notes: '',
      });

      // TODO: Send email notification to candidate
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule a video interview with {applicationData?.name} for {jobData?.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                <Clock className="h-4 w-4 inline mr-2" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for the interview..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
