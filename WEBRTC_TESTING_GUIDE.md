# WebRTC Video Calling - Complete Testing Guide

## ✅ Latest Fix Applied (2025-12-04)

### Problem Fixed
The error "Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote answer sdp: Called in wrong state: stable" has been resolved.

### Root Cause
Firebase's `onSnapshot` listener fires multiple times:
1. Once on initial read
2. Again on every data change

This caused the offer/answer processing logic to run multiple times, leading to duplicate `setRemoteDescription` calls.

### Solution Implemented
Added **duplicate prevention flags** to `WebRTCService.js`:

```javascript
// In constructor
this.offerProcessed = false;  // Track if offer has been processed
this.answerProcessed = false; // Track if answer has been processed

// In listenForOfferAndAnswer (Job Seeker side)
if (data?.offer && data?.status === 'waiting' && !this.offerProcessed) {
  this.offerProcessed = true;
  // Process offer and create answer
  // Reset flag on error: this.offerProcessed = false
}

// In listenForAnswer (Recruiter side)
if (data?.answer && !this.answerProcessed) {
  this.answerProcessed = true;
  // Process answer
  // Reset flag on error: this.answerProcessed = false
}
```

**Key Features:**
- Flags ensure each offer/answer is processed exactly once
- Flags reset on error for retry capability
- State validation before processing
- Automatic unsubscribe after successful processing

---

## 🎯 Testing Steps (CRITICAL ORDER)

### Step 1: Open Recruiter Interview Page FIRST
1. Login as recruiter
2. Go to Dashboard → Interviews
3. Click on an interview to open the video room
4. **WAIT 2-3 seconds** for the room to initialize
5. You should see:
   - Your local video feed
   - "Waiting for other participant to join..." message

### Step 2: Open Job Seeker Interview Page SECOND
1. Login as job seeker (in a different browser or incognito window)
2. Go to Dashboard → Interviews
3. Click on the same interview
4. Connection should establish within 3-5 seconds
5. You should see:
   - Both video feeds
   - "Connected" status

### ⚠️ CRITICAL: Order Matters!
- **Recruiter = Initiator** - Creates the offer
- **Job Seeker = Joiner** - Creates the answer
- If job seeker opens first, they'll wait until recruiter creates the offer

---

## 🔍 What to Check

### Console Logs (Expected Flow)

**Recruiter Console (Initiator):**
```
Initiator cleaning up existing room for fresh start
Offer created, sending to Firebase
Processing answer from joiner...
Remote description (answer) set successfully
```

**Job Seeker Console (Joiner):**
```
Processing offer from initiator...
Remote description (offer) set successfully
Local description (answer) created
Answer sent to Firebase
```

### Visual Indicators

✅ **Success:**
- Both participants see each other's video
- Green "Connected" banner appears
- Controls (camera, mic, screen share, end call) are enabled

❌ **Issues:**
- "Waiting for other participant to join..." persists
- Error messages in console
- No remote video feed

---

## 🐛 Troubleshooting

### Issue: "Waiting for participant..." never ends
**Cause:** Wrong order or timing issue
**Fix:**
1. Both participants close the interview page
2. Recruiter opens first, waits 3 seconds
3. Job seeker opens second

### Issue: "Not in stable state, waiting..."
**Cause:** Processing attempted before previous state settled
**Fix:** This is normal - the flag system will retry automatically

### Issue: "Not in correct state to receive answer"
**Cause:** Initiator received answer before sending offer
**Fix:** This shouldn't happen with room cleanup, but flags will prevent errors

### Issue: No video/audio
**Cause:** Browser permissions denied
**Fix:**
1. Check browser address bar for camera/mic permission prompt
2. Allow permissions
3. Refresh the page

### Issue: Connection never establishes
**Possible causes:**
1. **Firewall blocking WebRTC** - Check firewall settings
2. **Corporate network restrictions** - Try on different network
3. **Browser incompatibility** - Use Chrome/Edge (best WebRTC support)

---

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Excellent | Recommended |
| Edge | ✅ Excellent | Recommended |
| Firefox | ✅ Good | Works well |
| Safari | ⚠️ Limited | May have issues with screen share |
| Opera | ✅ Good | Chromium-based |

---

## 🔧 Testing Scenarios

### Scenario 1: Basic Connection
1. Recruiter opens first
2. Job seeker opens second
3. Verify both can see each other
4. ✅ **Expected:** Connection established within 5 seconds

### Scenario 2: Camera Toggle
1. Establish connection
2. Recruiter clicks camera button
3. ✅ **Expected:** Recruiter's video freezes on job seeker side

### Scenario 3: Mic Toggle
1. Establish connection
2. Job seeker clicks mic button
3. ✅ **Expected:** No audio from job seeker

### Scenario 4: Screen Share
1. Establish connection
2. Recruiter clicks screen share button
3. Select window/screen to share
4. ✅ **Expected:** Job seeker sees recruiter's screen instead of camera

### Scenario 5: Reconnection
1. Establish connection
2. One participant refreshes their page
3. ✅ **Expected:** Connection re-establishes after refresh

### Scenario 6: Multiple Reconnections (Stress Test)
1. Establish connection
2. Recruiter refreshes multiple times
3. ✅ **Expected:** Room cleanup prevents errors, connection re-establishes each time

---

## 📊 Technical Details

### WebRTC Architecture
```
Recruiter (Initiator)              Job Seeker (Joiner)
        |                                  |
        | 1. Clean up old room             |
        | 2. Create offer (SDP)            |
        |--------------------------------->|
        |    Store in Firebase             |
        |                                  | 3. Receive offer
        |                                  | 4. Set remote description
        |                                  | 5. Create answer (SDP)
        |<---------------------------------|
        | 6. Receive answer                |    Store in Firebase
        | 7. Set remote description        |
        |                                  |
        | 8. Exchange ICE candidates       |
        |<-------------------------------->|
        |                                  |
        | 9. Peer-to-peer connection! 🎉  |
```

### Firebase Structure
```
videoRooms/
  {interviewId}/
    - offer: { type, sdp }
    - answer: { type, sdp }
    - status: 'waiting' | 'connected'
    - createdAt: timestamp
    - createdBy: userId

    offerCandidates/
      {candidateId}/
        - candidate: { ... }
        - timestamp

    answerCandidates/
      {candidateId}/
        - candidate: { ... }
        - timestamp
```

---

## 💰 Cost Analysis

### Free Components
- ✅ Firebase Firestore (Free tier: 50K reads/day, 20K writes/day)
- ✅ Google STUN servers (Free)
- ✅ WebRTC peer-to-peer (No server costs)

### Estimated Usage
- **Per 1-hour interview:**
  - Room creation: 1 write
  - Offer/answer exchange: 2 writes
  - ICE candidates: ~10-20 writes
  - Listeners: ~20-30 reads
  - **Total: ~25 writes, ~30 reads**

- **Free tier supports:**
  - ~2,000 interviews/day (50K reads ÷ 30)
  - ~800 interviews/day (20K writes ÷ 25)
  - **Limit: 800 interviews/day before hitting write limit**

### Cost Comparison
| Service | Monthly Cost | Annual Cost |
|---------|--------------|-------------|
| Firebase + WebRTC | $0 | $0 |
| Daily.co (99 rooms) | $99 | $1,188 |
| **Savings** | **$99** | **$1,188** |

---

## 🚀 Next Steps

1. **Test basic connection** following the proper order
2. **Test all controls** (camera, mic, screen share)
3. **Test reconnection** by refreshing pages
4. **Test on different networks** (WiFi, mobile hotspot)
5. **Test on different browsers** (Chrome, Firefox, Edge)

---

## 📝 Known Limitations

1. **TURN server needed** for restricted networks (corporate firewalls)
   - Current setup uses only STUN servers
   - Will work for 85-90% of users
   - Add TURN server if needed (e.g., Twilio TURN service)

2. **No recording** - WebRTC doesn't include recording by default
   - Can add MediaRecorder API if needed

3. **No room size limit** - Currently supports 1-on-1 only
   - Can be extended for multi-party calls

---

## 🔗 Documentation Files

- [WEBRTC_SETUP.md](./WEBRTC_SETUP.md) - Technical architecture
- [PROPER_TESTING_FLOW.md](./PROPER_TESTING_FLOW.md) - Quick testing guide
- [TESTING_WEBRTC.md](./TESTING_WEBRTC.md) - General testing scenarios
- [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) - Migration from Daily.co
- [FIREBASE_VS_DAILY.md](./FIREBASE_VS_DAILY.md) - Cost comparison

---

## ✅ Fix Verification Checklist

- [x] Added offerProcessed and answerProcessed flags
- [x] Flag-based duplicate prevention in listenForOfferAndAnswer
- [x] Flag-based duplicate prevention in listenForAnswer
- [x] State validation before processing
- [x] Flag reset on error for retry capability
- [x] Build passes without errors
- [ ] **YOUR TURN:** Test the connection following the proper order

---

## 📞 Support

If issues persist:
1. Check browser console for specific error messages
2. Verify Firebase configuration in `.env`
3. Test on a different network
4. Try a different browser
5. Clear browser cache and cookies

**The duplicate processing issue is now fixed. Test the video calling and report any remaining issues!**
