# Daily.co Video Interview Setup Guide

This guide will help you set up Daily.co for the video interview feature in your AI Job Portal.

## Step 1: Create a Daily.co Account

1. Visit [https://www.daily.co/](https://www.daily.co/)
2. Click "Sign Up" or "Get Started Free"
3. Complete the registration with your email
4. Verify your email address

### Free Tier Features
- 1,000 minutes per month (free)
- Unlimited rooms
- Up to 10 participants per room
- Screen sharing and recording
- Perfect for development and small-scale production

## Step 2: Get Your API Credentials

1. Log in to your Daily.co account
2. Go to the **Dashboard**: [https://dashboard.daily.co/](https://dashboard.daily.co/)
3. Click on **Developers** in the left sidebar
4. Click on **API Keys**
5. You'll see two important values:

   - **Domain**: Something like `your-company.daily.co`
   - **API Key**: A long string starting with letters and numbers

## Step 3: Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values with your actual credentials:

```env
# Daily.co Configuration
DAILY_API_KEY=abc123xyz789your-actual-api-key-here
NEXT_PUBLIC_DAILY_DOMAIN=your-company.daily.co
```

**Important Notes:**
- `DAILY_API_KEY` is **private** (no `NEXT_PUBLIC_` prefix) - used server-side only
- `NEXT_PUBLIC_DAILY_DOMAIN` is **public** - used client-side for video calls
- Never commit your `.env` file to version control
- Keep your API key secure

## Step 4: Restart Your Development Server

After updating the `.env` file, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test the Video Interview Feature

1. **As a Recruiter:**
   - Go to Dashboard → Applicants
   - Find an application
   - Click "Schedule Interview"
   - Fill in the interview details
   - Click "Schedule"

2. **As a Job Seeker:**
   - Go to Dashboard → My Interviews
   - You should see the scheduled interview
   - Click "Join Interview" when it's time
   - Allow camera and microphone permissions

3. **During the Interview:**
   - Test camera toggle (video on/off)
   - Test microphone toggle (audio on/off)
   - Test screen sharing
   - Test the "Leave Call" button

## How It Works

### Backend (Server-Side)
Your API route at `/api/interview/create-room/route.js` handles:
- Creating Daily.co rooms using the API key
- Setting room properties (privacy, chat, screenshare, recording)
- Setting expiration time (rooms expire after 1 hour by default)

### Frontend (Client-Side)
The `VideoRoom.jsx` component handles:
- Embedding the Daily.co iframe
- Controlling camera and microphone
- Managing screen sharing
- Handling video call events (joined, left, errors)

## Troubleshooting

### "Mock room created" Message
If you see this message, it means:
- Your API key is not configured or invalid
- The system is using a mock room for development
- No actual video call will work

**Solution:** Double-check your `DAILY_API_KEY` in `.env`

### Camera/Microphone Not Working
- Make sure you've allowed browser permissions
- Check your browser settings for camera/microphone access
- Try in a different browser (Chrome/Edge work best)

### Room Creation Fails
- Verify your API key is correct
- Check your Daily.co account hasn't exceeded free tier limits
- Look at the console logs for detailed error messages

### Video Not Loading
- Check that `NEXT_PUBLIC_DAILY_DOMAIN` is set correctly
- Ensure your domain format is: `your-domain.daily.co` (no https://)
- Clear browser cache and reload

## Daily.co Dashboard Features

### Rooms
- View all created rooms
- See active participants
- Delete old rooms manually

### Logs
- View detailed logs of all video calls
- See connection quality metrics
- Debug issues with participants

### Analytics
- Track usage minutes
- Monitor room creation
- View participant statistics

## Security Best Practices

1. **API Key Security**
   - Never expose `DAILY_API_KEY` in client-side code
   - Keep it in `.env` file (not committed to Git)
   - Use environment variables in production (Vercel, etc.)

2. **Room Privacy**
   - Rooms are set to "private" by default
   - Only people with the room URL can join
   - Rooms expire after 1 hour

3. **Room Naming**
   - Room names include application ID and timestamp
   - Unique rooms for each interview
   - Easy to track and manage

## Production Deployment

When deploying to production (e.g., Vercel):

1. Go to your hosting platform's environment variables settings
2. Add these variables:
   ```
   DAILY_API_KEY=your-api-key
   NEXT_PUBLIC_DAILY_DOMAIN=your-domain.daily.co
   ```
3. Redeploy your application

## Upgrading Daily.co Plan

If you need more features:
- Visit [Daily.co Pricing](https://www.daily.co/pricing)
- Paid plans offer:
  - More minutes per month
  - More participants per room
  - Recording storage
  - RTMP streaming
  - Advanced analytics
  - SLA guarantees

## Additional Resources

- [Daily.co Documentation](https://docs.daily.co/)
- [Daily.co API Reference](https://docs.daily.co/reference/rest-api)
- [Daily.co React Guide](https://docs.daily.co/guides/products/prebuilt/getting-started/react)
- [Daily.co Support](https://help.daily.co/)

## Current Implementation Features

Your video interview system includes:
- ✅ Room creation via API
- ✅ Camera toggle
- ✅ Microphone toggle
- ✅ Screen sharing
- ✅ Leave call functionality
- ✅ Error handling
- ✅ Automatic cleanup
- ✅ Interview scheduling
- ✅ Interview status tracking

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review Daily.co dashboard logs
3. Check your API key is correct
4. Ensure you haven't exceeded free tier limits
5. Contact Daily.co support if needed
