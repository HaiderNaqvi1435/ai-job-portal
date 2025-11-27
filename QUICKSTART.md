# 🚀 Quick Start Guide - AI Job Portal

## ✅ What's Already Built

Your AI Job Portal has the following features ready to use:

### 1. **Public Landing Page**
- Beautiful hero section with job search
- Feature showcase
- Mock job listings
- Responsive design

### 2. **Authentication System**
- Email/password login and registration
- Role-based access (Job Seeker / Recruiter)
- Protected routes

### 3. **Job Seeker Dashboard**
- Personal dashboard with stats
- AI Resume Analyzer (fully functional)
- Links to AI tools

### 4. **6 AI-Powered API Routes**
All ready to use with OpenAI:
- Resume Analyzer
- ATS Optimization
- Skill Gap Analysis
- Job Description Generator
- Salary Insights
- Candidate Evaluation

---

## 🔧 Setup in 5 Minutes

### Step 1: Install Dependencies (if not done)
```bash
npm install
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "ai-job-portal"
4. **Enable Email/Password Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
5. **Create Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in test mode (we'll add rules later)
6. **Enable Storage:**
   - Go to Storage → Get started
   - Start in test mode

### Step 3: Get Firebase Config

1. In Firebase Console, go to Project Settings (⚙️ icon)
2. Scroll down to "Your apps"
3. Click Web icon (</>) to add web app
4. Register app with nickname "ai-job-portal-web"
5. Copy the config values

### Step 4: Setup Environment Variables

1. Open `.env.local` file (already created in your project)
2. Replace with your Firebase values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

### Step 5: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy and paste into `.env.local`

### Step 6: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 How to Test

### Test 1: Landing Page
1. Open http://localhost:3000
2. You should see the beautiful landing page
3. Browse job listings

### Test 2: Register Account
1. Click "Get Started" or "Sign Up"
2. Choose "Job Seeker" tab
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"

### Test 3: Job Seeker Dashboard
1. After registration, you'll be redirected to dashboard
2. You should see:
   - Welcome message with your name
   - Stats cards (all showing 0)
   - 4 AI-powered tool cards

### Test 4: AI Resume Analyzer
1. Click "Use Tool" on Resume Analyzer card
2. Paste this sample resume text:

```
John Doe
Software Engineer

SUMMARY
Experienced full-stack developer with 5 years of expertise in React, Node.js, and cloud technologies.

EXPERIENCE
Senior Software Engineer - Tech Corp (2020-2024)
- Developed scalable web applications using React and Node.js
- Led a team of 5 developers
- Improved application performance by 40%

Software Engineer - StartupXYZ (2018-2020)
- Built RESTful APIs using Express.js
- Implemented CI/CD pipelines

SKILLS
React, Node.js, JavaScript, TypeScript, AWS, Docker, MongoDB

EDUCATION
Bachelor of Science in Computer Science
State University, 2018
```

3. Click "Analyze Resume"
4. Wait 5-10 seconds
5. See AI-powered analysis with:
   - Overall score
   - Strengths
   - Weaknesses
   - Detected skills
   - Suggestions
   - Rewritten summary

### Test 5: Sign Out and Login
1. Click your avatar in top-right
2. Click "Sign out"
3. Click "Sign In"
4. Login with: test@example.com / password123

---

## 📊 Firestore Database Structure

The app will automatically create these collections when you use features:

### Collection: `users`
```javascript
{
  uid: "user123",
  name: "Test User",
  email: "test@example.com",
  role: "job_seeker", // or "recruiter"
  profile: {
    skills: [],
    experience: [],
    education: []
  },
  createdAt: "2024-11-27T...",
  updatedAt: "2024-11-27T..."
}
```

### Collection: `jobs`
```javascript
{
  recruiterId: "recruiter123",
  title: "Senior Developer",
  description: "...",
  skills: ["React", "Node.js"],
  location: "San Francisco",
  salaryMin: 120000,
  salaryMax: 180000,
  status: "active",
  createdAt: "2024-11-27T..."
}
```

### Collection: `applications`
```javascript
{
  userId: "user123",
  jobId: "job123",
  resumeUrl: "https://...",
  atsScore: 85,
  fitScore: 78,
  status: "pending",
  submittedAt: "2024-11-27T..."
}
```

---

## 🔒 Firebase Security Rules

After testing, add these security rules in Firestore:

1. Go to Firestore Database → Rules
2. Replace with:

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
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.recruiterId == request.auth.uid;
    }

    match /applications/{applicationId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/jobs/$(resource.data.jobId)).data.recruiterId == request.auth.uid
      );
      allow create: if request.auth != null;
    }

    match /skillGapReports/{reportId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /interviews/{interviewId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

---

## 🎨 Available Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes (Requires Login)
- `/dashboard` - Auto-redirects based on role
- `/dashboard/job-seeker` - Job seeker dashboard
- `/dashboard/job-seeker/resume-analyzer` - AI Resume Analyzer

### API Routes
- `POST /api/ai/analyze-resume` - Analyze resume
- `POST /api/ai/ats-optimization` - Optimize for ATS
- `POST /api/ai/skill-gap` - Skill gap analysis
- `POST /api/ai/generate-job` - Generate job description
- `POST /api/ai/salary-insights` - Get salary insights
- `POST /api/ai/evaluate-candidate` - Evaluate candidate

---

## 🛠️ Troubleshooting

### Issue: "Module not found"
```bash
npm install
```

### Issue: "Firebase error"
- Check `.env.local` has correct Firebase config
- Ensure Firebase services are enabled
- Restart dev server after changing `.env.local`

### Issue: "OpenAI API error"
- Verify OpenAI API key is correct
- Check you have credits in OpenAI account
- API key should start with `sk-proj-` or `sk-`

### Issue: Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📈 What's Next?

### To Complete the Project:

1. **Add More UI Pages** (3-4 hours):
   - ATS Optimization page
   - Skill Gap Analysis page
   - Salary Insights page
   - Recruiter Dashboard
   - Job Management pages

2. **Application System** (2-3 hours):
   - Job application form
   - Application tracking
   - Recruiter review panel

3. **Video Integration** (2-3 hours):
   - Choose SDK (Daily.co recommended)
   - Interview room component
   - Scheduling system

4. **Advanced Features** (3-4 hours):
   - File upload for resumes
   - Advanced search & filters
   - Notifications
   - Email integration

---

## 💰 Cost Estimates

### Firebase (Free Tier)
- Up to 50,000 reads/day
- Up to 20,000 writes/day
- 1 GB storage
- 10 GB bandwidth/month

### OpenAI API
- GPT-4: ~$0.03 per 1K tokens
- Average resume analysis: ~$0.10-0.30
- Budget: $10-20/month for testing

---

## 📞 Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

---

## ✅ Success Checklist

- [ ] Firebase project created
- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Can see landing page
- [ ] Can register account
- [ ] Can login
- [ ] Can see dashboard
- [ ] AI Resume Analyzer works
- [ ] No console errors

---

**Ready to code!** 🚀

Start with `npm run dev` and begin building amazing features!
