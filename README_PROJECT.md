# AI Job Portal - Setup Guide

## Project Overview

A comprehensive AI-powered job portal with:
- **Resume Analysis & ATS Optimization**
- **Skill Gap Analysis**
- **AI Job Post Generator**
- **Salary Insights**
- **Online Video Interviews**
- **Applicant Tracking System**

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4, shadcn/ui
- **State Management**: Zustand
- **Validation**: Zod
- **Authentication & Database**: Firebase (Auth, Firestore, Storage)
- **AI**: OpenAI GPT-4
- **Video**: Video SDK (to be integrated)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Enable Storage
6. Copy your Firebase config

### 3. Environment Variables

Create a `.env.local` file and add:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Video SDK (optional)
NEXT_PUBLIC_VIDEO_SDK_API_KEY=your_video_sdk_key
```

### 4. Firestore Database Structure

Create these collections in Firestore:

#### users
```
{
  uid: string,
  name: string,
  email: string,
  role: "job_seeker" | "recruiter",
  profile: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### jobs
```
{
  recruiterId: string,
  title: string,
  description: string,
  responsibilities: array,
  requirements: array,
  skills: array,
  location: string,
  locationType: string,
  employmentType: string,
  experienceLevel: string,
  salaryMin: number,
  salaryMax: number,
  status: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### applications
```
{
  userId: string,
  jobId: string,
  resumeUrl: string,
  coverLetter: string,
  atsScore: number,
  fitScore: number,
  status: string,
  submittedAt: timestamp
}
```

#### skillGapReports
```
{
  userId: string,
  jobId: string,
  skillsFound: array,
  skillsMissing: array,
  weakSkills: array,
  recommendedCourses: array,
  improvementTips: array,
  createdAt: timestamp
}
```

#### interviews
```
{
  jobId: string,
  userId: string,
  recruiterId: string,
  meetingLink: string,
  scheduledAt: timestamp,
  status: string,
  notes: string,
  createdAt: timestamp
}
```

### 5. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.token.role == 'recruiter';
      allow update, delete: if request.auth != null && resource.data.recruiterId == request.auth.uid;
    }

    match /applications/{applicationId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.recruiterId == request.auth.uid
      );
      allow create: if request.auth != null && request.auth.token.role == 'job_seeker';
      allow update: if request.auth != null;
    }

    match /skillGapReports/{reportId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        resource.data.recruiterId == request.auth.uid
      );
    }
  }
}
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/ai/              # AI API routes
│   │   ├── analyze-resume/
│   │   ├── ats-optimization/
│   │   ├── skill-gap/
│   │   ├── generate-job/
│   │   ├── salary-insights/
│   │   └── evaluate-candidate/
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Protected dashboards
│   │   ├── job-seeker/
│   │   └── recruiter/
│   └── page.jsx             # Public landing page
├── components/
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   ├── landing/             # Landing page components
│   ├── providers/           # Context providers
│   └── ui/                  # shadcn components
├── lib/
│   ├── api/                 # API helpers
│   ├── firebase.js          # Firebase config
│   └── schemas.js           # Zod schemas
├── store/                   # Zustand stores
│   ├── useAuthStore.js
│   ├── useJobStore.js
│   └── useApplicationStore.js
├── hooks/                   # Custom hooks
│   └── useAuth.js
└── types/                   # Type definitions
    └── index.js
```

## Features Implemented

### ✅ Completed
1. Public landing page with job listings
2. Authentication (Login/Register)
3. Job Seeker Dashboard
4. AI Resume Analyzer
5. ATS Optimization API
6. Skill Gap Analysis API
7. AI Job Post Generator API
8. Salary Insights API
9. Candidate Evaluation API

### 🚧 To Be Completed
1. Recruiter Dashboard
2. Job Management (CRUD)
3. Application System
4. Video Interview Integration
5. Advanced Search & Filters
6. Applicant Ranking System

## User Roles

### Job Seeker
- Upload and analyze resumes
- Optimize for ATS
- Get skill gap analysis
- Search and apply to jobs
- Track applications
- Attend video interviews

### Recruiter
- Generate AI job descriptions
- Post and manage jobs
- Review applications
- Evaluate candidates with AI
- Schedule interviews
- Conduct video interviews

## Important Notes

1. **OpenAI API Key**: You need a valid OpenAI API key for AI features to work
2. **Firebase**: Ensure all Firebase services are enabled
3. **Security**: Never commit `.env.local` to version control
4. **Cost**: OpenAI API calls are paid - monitor usage

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

This project is for educational/portfolio purposes.
