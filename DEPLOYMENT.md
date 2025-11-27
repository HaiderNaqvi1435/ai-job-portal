# 🚀 Deployment Guide - AI Job Portal

## Quick Deploy to Vercel (5 Minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Firebase project setup
- OpenAI API key

---

## Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Complete AI Job Portal implementation"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/ai-job-portal.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to GitHub repo
# - Add environment variables
# - Deploy
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your `ai-job-portal` repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

---

## Step 3: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI
OPENAI_API_KEY=sk-proj-your_actual_openai_key

# Video SDK (optional)
NEXT_PUBLIC_VIDEO_SDK_API_KEY=your_video_sdk_key
```

**Important**: Add to all environments (Production, Preview, Development)

---

## Step 4: Configure Firebase for Production

### Update Firebase Console

1. **Add Production Domain**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to authorized domains:
     - `your-app.vercel.app`
     - Your custom domain (if any)

2. **Update Firestore Rules**
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
         allow update: if request.auth != null;
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

3. **Update Storage Rules**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /resumes/{userId}/{fileName} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /job-attachments/{fileName} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

---

## Step 5: Test Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test critical flows:
   - [ ] Landing page loads
   - [ ] Can register account
   - [ ] Can login
   - [ ] Job seeker dashboard loads
   - [ ] Recruiter dashboard loads
   - [ ] Can browse jobs
   - [ ] Can create job (recruiter)
   - [ ] AI features work

---

## Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `aijobportal.com`)
3. Follow DNS configuration instructions
4. Add domain to Firebase authorized domains

---

## Performance Optimization

### Vercel Automatically Handles
- ✅ CDN distribution
- ✅ Image optimization
- ✅ Edge caching
- ✅ Automatic HTTPS
- ✅ Gzip compression

### Additional Optimizations

1. **Enable Analytics**
   ```bash
   # Add Vercel Analytics
   npm install @vercel/analytics
   ```

   Update `src/app/layout.jsx`:
   ```javascript
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Add Speed Insights**
   ```bash
   npm install @vercel/speed-insights
   ```

   Update `src/app/layout.jsx`:
   ```javascript
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

---

## Monitoring & Maintenance

### 1. Vercel Dashboard
- Monitor deployments
- Check build logs
- View analytics
- Monitor performance

### 2. Firebase Console
- Monitor Auth usage
- Check Firestore reads/writes
- Monitor Storage usage
- View error logs

### 3. OpenAI Dashboard
- Monitor API usage
- Track costs
- Set spending limits

---

## Cost Estimates

### Free Tier (Good for Development & Small Projects)

**Vercel**
- 100 GB bandwidth/month
- Unlimited deployments
- Free custom domain
- **Cost**: $0

**Firebase**
- 50K reads/day
- 20K writes/day
- 1 GB storage
- 10 GB bandwidth/month
- **Cost**: $0

**OpenAI**
- Pay per use
- ~$0.10-0.30 per resume analysis
- **Cost**: ~$10-20/month for testing

**Total**: ~$10-20/month

### Production Scale

**Vercel Pro** ($20/month)
- Unlimited bandwidth
- Advanced analytics
- Password protection

**Firebase Blaze** (Pay as you go)
- $0.06 per 100K reads
- $0.18 per 100K writes
- Typical: $25-50/month

**OpenAI**
- Depends on usage
- Budget: $50-200/month

**Total**: ~$100-300/month for moderate traffic

---

## Security Checklist

### Before Going Live

- [ ] Environment variables are secure
- [ ] Firebase rules are production-ready
- [ ] API keys are not exposed in client code
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (Firebase)
- [ ] Input validation on all forms
- [ ] SQL injection protection (N/A - using Firestore)
- [ ] XSS protection (React handles this)
- [ ] CSRF tokens (if needed)

---

## Backup Strategy

### Firebase Backup

1. **Automated Backups**
   ```bash
   # Using Firebase CLI
   firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
   ```

2. **Schedule with GitHub Actions**
   Create `.github/workflows/backup.yml`:
   ```yaml
   name: Backup Firestore
   on:
     schedule:
       - cron: '0 0 * * 0'  # Weekly

   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Backup Firestore
           run: |
             # Add backup script
   ```

---

## Rollback Plan

### If Deployment Fails

1. **Vercel**: Instant rollback
   - Go to Deployments
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Database**: Use Firebase backup
   ```bash
   firebase firestore:import gs://your-bucket/backups/20240101
   ```

---

## CI/CD Pipeline

### Auto-Deploy on Push

Vercel automatically:
1. Detects push to `main` branch
2. Runs build
3. Runs tests (if configured)
4. Deploys to production
5. Sends Slack/Email notification (if configured)

### Preview Deployments

- Every PR gets a preview URL
- Test changes before merging
- Share with team for review

---

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. Module not found - run npm install
# 3. TypeScript errors - check build output
```

### Runtime Errors

```bash
# Check Vercel Function logs
# Enable error reporting:
# - Sentry
# - Vercel Analytics
# - Custom error tracking
```

### Firebase Connection Issues

```bash
# Verify:
# 1. API keys are correct
# 2. Domain is authorized
# 3. Firestore rules allow access
# 4. Network requests aren't blocked
```

---

## Post-Deployment

### 1. Test Everything
- Create test accounts (job seeker & recruiter)
- Run through all flows
- Test on mobile devices
- Check different browsers

### 2. Set Up Monitoring
- Google Analytics
- Vercel Analytics
- Error tracking (Sentry)
- Uptime monitoring (UptimeRobot)

### 3. Documentation
- Update README with live URL
- Create user guide
- Document admin procedures

### 4. SEO Optimization
- Add sitemap.xml
- Configure robots.txt
- Add meta tags
- Submit to Google Search Console

---

## Scaling Considerations

### When You Need to Scale

**100+ concurrent users**:
- Upgrade Vercel to Pro
- Monitor Firebase usage
- Consider Redis for caching

**1000+ concurrent users**:
- Implement rate limiting
- Add CDN for assets
- Consider database indexing
- Implement queue for AI requests

**10,000+ concurrent users**:
- Microservices architecture
- Load balancing
- Database sharding
- Dedicated AI API server

---

## Success! 🎉

Your AI Job Portal is now live and accessible to the world!

**Next Steps**:
1. Share URL with friends/colleagues
2. Add to your portfolio
3. Post on LinkedIn
4. Submit to job boards (if commercial)
5. Gather user feedback
6. Iterate and improve

---

**Deployment Checklist**:
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Firebase domains authorized
- [ ] Firestore rules updated
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Analytics set up
- [ ] Monitoring enabled
- [ ] Backup strategy in place

---

**Your live app**: https://your-app.vercel.app

**Congrats on deploying your AI Job Portal!** 🚀
