# Proper WebRTC Testing Flow

## The Correct Order

### ✅ Step 1: Recruiter Starts First (IMPORTANT!)

The **recruiter must open the interview page FIRST** because they are the **initiator**:
- Cleans up any old room data
- Creates fresh room
- Generates WebRTC offer
- Waits for job seeker to join

### ✅ Step 2: Job Seeker Joins Second

The **job seeker opens the interview page SECOND** because they are the **joiner**:
- Waits for valid offer from recruiter
- Creates WebRTC answer
- Establishes connection

## Why This Order Matters

### Initiator (Recruiter) Role:
1. **Creates the room** - Sets up Firebase document
2. **Generates offer** - Creates SDP offer with media details
3. **Sends ICE candidates** - Collects network traversal data
4. **Waits for answer** - Listens for job seeker's response

### Joiner (Job Seeker) Role:
1. **Waits for offer** - Listens for recruiter's offer
2. **Generates answer** - Creates SDP answer in response
3. **Sends ICE candidates** - Collects network traversal data
4. **Establishes connection** - Completes WebRTC handshake

## Testing Instructions

### Preparation
1. **Two browsers or browser windows**
   - Chrome (normal): Recruiter
   - Firefox (or Chrome incognito): Job seeker

2. **Log in to both accounts**
   - Browser 1: Recruiter account
   - Browser 2: Job seeker account

3. **Have an interview scheduled**
   - Note the interview ID from URL

### Correct Testing Procedure

#### ✅ DO THIS:

**Step 1: Open Recruiter Side FIRST**
```
1. Browser 1 (Recruiter):
   - Go to /dashboard/recruiter/interviews
   - Click on the interview
   - Wait for "Connecting to video call..."
   - You'll see your own video
   - Status: "Connecting..." or "Waiting for other participant"
```

**Step 2: Wait 2-3 Seconds**
```
- Let the recruiter side fully initialize
- Room is created
- Offer is generated and stored in Firebase
```

**Step 3: Open Job Seeker Side SECOND**
```
2. Browser 2 (Job Seeker):
   - Go to /dashboard/job-seeker/interviews
   - Click on the SAME interview
   - Wait for "Connecting to video call..."
   - You'll see your own video
   - Connection starts immediately
```

**Step 4: Connection Establishes (2-5 seconds)**
```
- Both sides show "Connected"
- Both see each other's video
- Green connection indicator
```

#### ❌ DON'T DO THIS:

**Wrong Order: Job Seeker First**
```
❌ Job Seeker opens first
❌ No offer available yet
❌ Gets stuck on "Waiting for other participant..."
❌ Recruiter joins later
❌ Might cause state errors
```

**Solution:** Always start with recruiter!

## Expected Console Logs

### Recruiter Console (Browser 1):
```javascript
// Step 1: Room cleanup
"Initiator cleaning up existing room for fresh start"

// Step 2: Media initialized
"Media devices accessed"

// Step 3: Offer created
"Offer created, sending to Firebase"

// Step 4: Waiting for answer
"Listening for answer from joiner"

// Step 5: Answer received
"Answer received from joiner"

// Step 6: Connection established
"Connection state: connected"
```

### Job Seeker Console (Browser 2):
```javascript
// Step 1: Media initialized
"Media devices accessed"

// Step 2: Waiting for offer
"Waiting for offer from initiator"

// Step 3: Offer received
"Remote description set successfully"

// Step 4: Answer created
"Answer created and sent"

// Step 5: Connection established
"Connection state: connected"
```

## Troubleshooting by Order

### If Recruiter Connects But Job Seeker Doesn't:

**Check:**
1. Did job seeker wait 2-3 seconds after recruiter?
2. Is offer present in Firebase? (check `videoRooms/{interviewId}`)
3. Check job seeker browser console for errors

**Fix:**
- Refresh job seeker page
- Wait for recruiter to fully initialize first

### If Both Show "Waiting for other participant":

**Check:**
1. Are both users opening the same interview ID?
2. Check Firebase `videoRooms/{interviewId}` - does it have both offer and answer?
3. Check browser consoles for ICE candidate errors

**Fix:**
- Close both pages
- Start fresh: Recruiter first, wait 3 seconds, then job seeker

### If You Get "Called in wrong state" Error:

**Cause:** Job seeker joined too quickly or in wrong order

**Fix:**
1. Close both pages
2. Recruiter opens FIRST
3. Wait 3-5 seconds
4. Job seeker opens SECOND

## Testing Checklist

### Before Testing:
- [ ] Two browsers/windows ready
- [ ] Both accounts logged in
- [ ] Interview scheduled and ID known
- [ ] Browser permissions for camera/mic allowed

### During Testing:
- [ ] Recruiter opens interview page FIRST
- [ ] Wait 2-3 seconds for full initialization
- [ ] Job seeker opens interview page SECOND
- [ ] Wait 2-5 seconds for connection
- [ ] Both see "Connected" status
- [ ] Both see each other's video
- [ ] Test camera toggle (both sides)
- [ ] Test microphone toggle (both sides)
- [ ] Test screen share (one side)
- [ ] Test end call (both sides)

### After Testing:
- [ ] Both disconnected cleanly
- [ ] No errors in console
- [ ] Can reconnect successfully
- [ ] Room data cleaned up properly

## Common Patterns

### Pattern 1: Fresh Interview
```
Recruiter → Initialize → Offer → Wait
                                  ↓
                     Job Seeker → Answer → Connect ✅
```

### Pattern 2: Reconnection
```
Both disconnect
       ↓
Recruiter → Cleanup → Initialize → Offer → Wait
                                            ↓
                          Job Seeker → Answer → Connect ✅
```

### Pattern 3: Wrong Order (Don't Do This!)
```
Job Seeker → Wait (no offer) ❌
       ↓
Recruiter → Initialize → Offer
       ↓
Job Seeker still waiting or state error ❌
```

## Browser Console Commands (For Debugging)

### Check WebRTC Connection State:
```javascript
// In browser console
console.log(webrtcService.peerConnection.connectionState)
// Should be: "connected"
```

### Check Signaling State:
```javascript
console.log(webrtcService.peerConnection.signalingState)
// Recruiter after offer: "have-local-offer"
// Job seeker after answer: "stable"
// Both after connection: "stable"
```

### Check ICE Connection State:
```javascript
console.log(webrtcService.peerConnection.iceConnectionState)
// Should be: "connected" or "completed"
```

## Firebase Firestore Check

### Navigate to Firebase Console:
```
Firebase Console → Firestore Database → videoRooms → {interviewId}
```

### Expected Structure After Both Connect:
```javascript
{
  createdAt: Timestamp,
  createdBy: "recruiter-uid",
  participants: ["recruiter-uid"],
  status: "connected",
  offer: {
    type: "offer",
    sdp: "v=0\no=- ..." // Long SDP string
  },
  answer: {
    type: "answer",
    sdp: "v=0\no=- ..." // Long SDP string
  }
}

// Subcollections:
offerCandidates/  // Should have multiple documents
answerCandidates/ // Should have multiple documents
```

## Success Indicators

### Visual:
- ✅ Both users see their own video
- ✅ Both users see each other's video
- ✅ Green "Connected" status message
- ✅ All control buttons enabled

### Console:
- ✅ No errors in red
- ✅ "Connected" state logged
- ✅ ICE candidates being added
- ✅ No "wrong state" errors

### Firebase:
- ✅ Room document exists
- ✅ Has both offer and answer
- ✅ Has ICE candidate subcollections
- ✅ Status shows "connected"

## Quick Reference

### Start Order:
1. **Recruiter** (Initiator) - Opens FIRST
2. **Wait 2-3 seconds**
3. **Job Seeker** (Joiner) - Opens SECOND
4. **Connection** - Establishes automatically

### If Issues:
1. **Close both pages**
2. **Start fresh**
3. **Follow order exactly**
4. **Wait between steps**

Remember: **Recruiter always goes first!** 👨‍💼 → 👔
