# 🗺️ Development Roadmap - AI Job Portal

## Current Status: Foundation Complete ✅

**Completion: ~60%** | **Remaining: 14-18 hours**

---

## Phase 1: Job Seeker Features ⏱️ 3-4 hours

### Task 1.1: ATS Optimization Page
**Priority**: HIGH | **Time**: 1 hour

Create `src/app/dashboard/job-seeker/ats-optimization/page.jsx`

**Features:**
- Two-column layout (Resume input + Job description input)
- ATS score display with progress bar
- Matched keywords (green badges)
- Missing keywords (red badges)
- Optimized resume output
- Keyword density meter
- Download optimized resume button

**API**: Already complete at `/api/ai/ats-optimization`

---

### Task 1.2: Skill Gap Analysis Page
**Priority**: HIGH | **Time**: 1 hour

Create `src/app/dashboard/job-seeker/skill-gap/page.jsx`

**Features:**
- Resume + Job description inputs
- Fit score (0-100) with circular progress
- Skills found (green checkmarks)
- Skills missing (red X marks)
- Weak skills (yellow warning)
- Recommended courses table (skill, course, platform, time)
- Market demand chart
- Improvement tips list

**API**: Already complete at `/api/ai/skill-gap`

---

### Task 1.3: Salary Insights Page
**Priority**: MEDIUM | **Time**: 1 hour

Create `src/app/dashboard/job-seeker/salary-insights/page.jsx`

**Features:**
- Job title + location inputs
- Salary range display (min, max, median)
- Skill demand score gauge
- Market trend indicator
- Level comparison chart (entry/mid/senior)
- Top-paying companies list
- Recommendations section

**API**: Already complete at `/api/ai/salary-insights`

---

### Task 1.4: Resume File Upload
**Priority**: MEDIUM | **Time**: 1-2 hours

**Files to modify:**
- `src/app/dashboard/job-seeker/resume-analyzer/page.jsx`
- Create: `src/lib/utils/pdf-parser.js`

**Features:**
- File drop zone (drag & drop)
- PDF/DOC/DOCX support
- File size validation (max 5MB)
- PDF text extraction
- Store in Firebase Storage
- Save resume URL in user profile

**Libraries needed:**
```bash
npm install pdf-parse mammoth
```

---

## Phase 2: Recruiter Dashboard ⏱️ 4-5 hours

### Task 2.1: Recruiter Dashboard
**Priority**: HIGH | **Time**: 1.5 hours

Create `src/app/dashboard/recruiter/page.jsx`

**Features:**
- Welcome message with company name
- Stats cards:
  - Active jobs
  - Total applicants
  - Interviews scheduled
  - Positions filled
- Quick actions:
  - Post new job
  - Generate AI job description
  - View all applicants
  - Schedule interviews
- Recent applications list
- Job performance chart

---

### Task 2.2: AI Job Generator Page
**Priority**: HIGH | **Time**: 1.5 hours

Create `src/app/dashboard/recruiter/generate-job/page.jsx`

**Features:**
- Form inputs:
  - Job title
  - Industry
  - Experience level
  - Key skills (comma-separated)
  - Location
  - Employment type
- Generate button with loading state
- Generated output:
  - Title
  - Description
  - Responsibilities list
  - Requirements list
  - Skills badges
  - Benefits list
  - Salary range
- Edit generated content
- Save to drafts
- Post immediately button

**API**: Already complete at `/api/ai/generate-job`

---

### Task 2.3: Job Management Pages
**Priority**: HIGH | **Time**: 2 hours

#### Create Job List Page
`src/app/dashboard/recruiter/jobs/page.jsx`
- Table view of all jobs
- Status badges (Active/Closed/Draft)
- Applicant count per job
- Edit/Delete actions
- Filter by status
- Search by title

#### Create Job Form Page
`src/app/dashboard/recruiter/jobs/create/page.jsx`
- All job fields with validation
- Skills multi-select
- Salary range inputs
- Rich text editor for description
- Save as draft option
- Publish button

#### Edit Job Page
`src/app/dashboard/recruiter/jobs/[id]/edit/page.jsx`
- Pre-filled form
- Update functionality
- Delete confirmation

**Database**: Firebase helpers already created

---

## Phase 3: Application System ⏱️ 3-4 hours

### Task 3.1: Public Job Listing & Details
**Priority**: HIGH | **Time**: 1.5 hours

#### Enhance Job List Page
`src/app/jobs/page.jsx`
- Real data from Firebase (not mock)
- Advanced filters:
  - Location
  - Salary range
  - Skills (multi-select)
  - Employment type
  - Experience level
- Sort options (newest, salary, relevance)
- Pagination
- Save job button (login required)

#### Job Details Page
`src/app/jobs/[id]/page.jsx`
- Full job information
- Company details
- Apply button (redirects to login if not authenticated)
- Share job button
- Save job button
- Similar jobs section

---

### Task 3.2: Application Flow
**Priority**: HIGH | **Time**: 1.5 hours

#### Application Form
`src/app/jobs/[id]/apply/page.jsx`
- Protected route (job seekers only)
- Resume selection (from profile or upload new)
- Cover letter textarea
- Portfolio URL (optional)
- LinkedIn URL (optional)
- Additional info
- Calculate ATS score before submit
- Show fit score
- Submit button

#### My Applications Page
`src/app/dashboard/job-seeker/applications/page.jsx`
- List all applications
- Status badges
- ATS & fit scores
- Applied date
- Job details
- Withdraw application option
- Filter by status

---

### Task 3.3: Recruiter Application Review
**Priority**: HIGH | **Time**: 1 hour

#### Applicants List
`src/app/dashboard/recruiter/jobs/[id]/applicants/page.jsx`
- Table of all applicants for a job
- Candidate name, email
- ATS score, fit score
- Application date
- Status dropdown (Pending/Reviewed/Shortlisted/Rejected)
- View resume button
- Evaluate button

#### Candidate Evaluation
`src/app/dashboard/recruiter/applicants/[id]/evaluate/page.jsx`
- Candidate profile
- Resume viewer
- AI evaluation button
- Show AI analysis:
  - Overall score
  - Match score
  - Strengths & concerns
  - Recommendation
  - Interview questions
- Manual notes textarea
- Schedule interview button
- Update status buttons

**API**: Already complete at `/api/ai/evaluate-candidate`

---

## Phase 4: Video Interview Integration ⏱️ 3-4 hours

### Task 4.1: Choose & Setup Video SDK
**Priority**: MEDIUM | **Time**: 1 hour

**Recommended**: Daily.co (easiest integration)

**Alternatives**: Zoom SDK, Agora, Twilio Video

**Setup Steps:**
1. Create Daily.co account
2. Get API key
3. Install SDK:
```bash
npm install @daily-co/daily-js
```
4. Add to `.env.local`:
```env
NEXT_PUBLIC_DAILY_API_KEY=your_key
```

---

### Task 4.2: Interview Scheduling
**Priority**: MEDIUM | **Time**: 1 hour

#### Schedule Interview Page (Recruiter)
`src/app/dashboard/recruiter/interviews/schedule/page.jsx`
- Select applicant
- Select job
- Date & time picker
- Duration selector
- Meeting title
- Notes textarea
- Create meeting link (Daily.co API)
- Send email notification

---

### Task 4.3: Interview Room Component
**Priority**: MEDIUM | **Time**: 1.5-2 hours

#### Video Room Page
`src/app/interviews/[id]/page.jsx`
- Protected route
- Daily.co iframe integration
- Pre-call device check
- Join button
- In-call controls:
  - Mute/unmute
  - Camera on/off
  - Screen share
  - Leave call
- Post-call notes
- Recording (if enabled)

#### Interview List Pages
- Job seeker: `src/app/dashboard/job-seeker/interviews/page.jsx`
- Recruiter: `src/app/dashboard/recruiter/interviews/page.jsx`
- Upcoming interviews
- Past interviews
- Join meeting buttons
- Interview notes

**Database**: Firebase helpers already created

---

## Phase 5: Advanced Features ⏱️ 3-4 hours

### Task 5.1: Advanced Job Search
**Priority**: MEDIUM | **Time**: 1 hour

Enhance `src/app/jobs/page.jsx`
- Autocomplete for job titles
- Location autocomplete (Google Places API)
- Skill tags (clickable)
- Salary range slider
- Date posted filter
- Remote/Hybrid/Onsite filters
- Save search functionality
- Search history

---

### Task 5.2: Saved Jobs
**Priority**: LOW | **Time**: 1 hour

#### Saved Jobs Collection
Add to Firebase: `savedJobs`
```javascript
{
  userId: string,
  jobId: string,
  savedAt: timestamp
}
```

#### Saved Jobs Page
`src/app/dashboard/job-seeker/saved-jobs/page.jsx`
- Grid of saved jobs
- Unsave button
- Apply button
- Job expiration indicators

---

### Task 5.3: Notifications System
**Priority**: LOW | **Time**: 1.5-2 hours

#### Notification Component
- Bell icon in navbar
- Unread count badge
- Dropdown with notifications
- Mark as read

#### Notification Types
- New job match
- Application status change
- Interview scheduled
- Interview reminder
- Message from recruiter

#### Firebase Collection
```javascript
{
  userId: string,
  type: string,
  title: string,
  message: string,
  read: boolean,
  link: string,
  createdAt: timestamp
}
```

---

### Task 5.4: Email Integration
**Priority**: LOW | **Time**: 1-2 hours

**Option 1**: Firebase Cloud Functions + SendGrid
**Option 2**: Resend (modern email API)

**Email Types:**
- Welcome email
- Application confirmation
- Interview invitation
- Status updates
- Weekly job matches

---

## Phase 6: Polish & Deploy ⏱️ 2-3 hours

### Task 6.1: Error Handling
- Global error boundary
- API error handling
- Form error messages
- Network error handling
- 404 page
- 500 error page

---

### Task 6.2: Loading States
- Page loading skeletons
- Button loading states
- API call loading indicators
- Lazy loading images
- Suspense boundaries

---

### Task 6.3: SEO Optimization
- Meta tags for all pages
- Open Graph tags
- JSON-LD structured data
- Sitemap generation
- robots.txt

---

### Task 6.4: Performance
- Image optimization
- Code splitting
- Bundle analysis
- Lazy loading
- Caching strategies

---

### Task 6.5: Testing
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Manual testing checklist

---

### Task 6.6: Deployment
- Vercel deployment
- Environment variables setup
- Domain configuration
- Firebase production setup
- Analytics integration (Google Analytics)

---

## Optional Enhancements 🌟

### Later Additions
1. **Resume Builder** (3-4 hours)
   - Template selection
   - Drag & drop sections
   - Live preview
   - PDF export

2. **Company Profiles** (2-3 hours)
   - Public company pages
   - Company reviews
   - Employee count
   - Benefits showcase

3. **Job Alerts** (1-2 hours)
   - Email job alerts
   - Custom alert criteria
   - Weekly digest

4. **Chat System** (3-4 hours)
   - Recruiter-candidate messaging
   - Real-time chat
   - File sharing

5. **Analytics Dashboard** (2-3 hours)
   - Recruiter analytics
   - Application funnel
   - Time-to-hire metrics

6. **Mobile App** (20-30 hours)
   - React Native app
   - Push notifications
   - Mobile-optimized features

---

## Development Tips

### Daily Goals
- Set realistic 2-3 hour coding sessions
- Complete 1-2 tasks per session
- Test after each feature
- Commit frequently

### Code Quality
- Follow existing patterns
- Add JSDoc comments
- Use consistent naming
- Validate all inputs

### Testing Strategy
- Test each feature immediately
- Use real data early
- Test on mobile devices
- Get user feedback

---

## Timeline Estimate

### Week 1 (10-12 hours)
- Complete Job Seeker features
- Build Recruiter dashboard
- Implement AI Job Generator

### Week 2 (10-12 hours)
- Build application system
- Recruiter review features
- Job management pages

### Week 3 (8-10 hours)
- Video integration
- Advanced features
- Polish & testing

### Week 4 (4-6 hours)
- Final testing
- Documentation
- Deployment

**Total**: 32-40 hours for complete project

---

## Success Criteria

✅ All user roles functional
✅ All AI features working
✅ Application flow complete
✅ Video interviews operational
✅ Mobile responsive
✅ No console errors
✅ Build passing
✅ Deployed to production
✅ Performance score >90
✅ SEO optimized

---

**Start with Phase 1, Task 1.1** and work sequentially!

Good luck! 🚀
