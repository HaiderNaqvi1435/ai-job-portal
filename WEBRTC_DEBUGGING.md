# WebRTC Debugging Guide

## 🔍 Latest Update (2025-12-04)

Added comprehensive logging and additional checks to prevent SDP-related errors:

### New Fixes Applied

1. **Check for existing local description before creating offer**
   - Prevents "SDP does not match previously generated SDP" error
   - Skips offer creation if already done

2. **Check for existing local description before creating answer**
   - Prevents duplicate answer creation
   - Ensures joiner doesn't recreate answer

3. **Enhanced console logging**
   - Detailed logs for every step
   - Prefixed with "Initiator:" or "Joiner:" for clarity
   - Shows signaling states at each step

---

## 📊 Expected Console Log Flow

### Recruiter (Initiator) Console - Expected Logs

```javascript
// Step 1: Join Room
Initiator: Joining room {interviewId}
Initiator: Room exists: true/false
Initiator: Cleaning up existing room for fresh start  // if room exists
Initiator: Creating peer connection
Initiator: Creating offer and listening for answer
Initiator: Starting to listen for ICE candidates
Initiator: Room join setup complete

// Step 2: Create Offer
Creating offer...
Offer created, sending to Firebase
Offer sent to Firebase successfully

// Step 3: Listen for Answer
Initiator: Starting to listen for answer...
Initiator: Answer received from joiner
Initiator: Current signaling state: have-local-offer
Initiator: Current remote description: none
Initiator: Setting remote description (answer)...
Initiator: Remote description (answer) set successfully
Initiator: Final signaling state: stable

// Step 4: Connection State Changes
Initiator: Connection state changed to: connecting
Initiator: Connection state changed to: connected
Initiator: Remote track received
```

### Job Seeker (Joiner) Console - Expected Logs

```javascript
// Step 1: Join Room
Joiner: Joining room {interviewId}
Joiner: Room exists: true
Joiner: Creating peer connection
Joiner: Listening for offer to create answer
Joiner: Starting to listen for ICE candidates
Joiner: Room join setup complete

// Step 2: Listen for Offer
Joiner: Starting to listen for offer...
Joiner: Offer received from initiator
Joiner: Current signaling state: stable
Joiner: Current local description: none
Joiner: Current remote description: none
Joiner: Setting remote description (offer)...
Joiner: Remote description (offer) set successfully
Joiner: New signaling state after setRemoteDescription: have-remote-offer

// Step 3: Create Answer
Joiner: Creating answer...
Joiner: Local description (answer) created and set
Joiner: Final signaling state: stable
Joiner: Sending answer to Firebase...
Joiner: Answer sent to Firebase successfully

// Step 4: Connection State Changes
Joiner: Connection state changed to: connecting
Joiner: Connection state changed to: connected
Joiner: Remote track received
Joiner: Adding ICE candidate...
```

---

## ❌ Common Errors and Solutions

### Error 1: "The SDP does not match the previously generated SDP for this type"

**What it means:** Trying to set a local description when one already exists.

**Console logs to check:**
```
Initiator: Current signaling state: stable
Offer already created, skipping...
```
OR
```
Joiner: Current local description: exists
Joiner: Answer already created, skipping...
```

**Fixed by:**
- Checking `this.peerConnection.localDescription` before creating offer/answer
- Skipping if description already exists

**If still occurring:**
1. Refresh BOTH browser windows
2. Clear browser cache
3. Recruiter opens first, wait 5 seconds, then job seeker opens

---

### Error 2: "Called in wrong state: stable"

**What it means:** Trying to set remote description when peer connection is in wrong state.

**Console logs to check:**
```
Initiator: Not in correct state to receive answer, current state: stable
// Should be: have-local-offer
```
OR
```
Joiner: Not in stable state, waiting... Current state: have-remote-offer
// Should be: stable
```

**Fixed by:**
- Checking signaling state before processing
- Resetting flags for retry

**If still occurring:**
1. Check if offer was created successfully: Look for "Offer sent to Firebase successfully"
2. Check if joiner is processing before initiator creates offer
3. Verify proper testing order (recruiter first, then job seeker)

---

### Error 3: Connection Never Establishes

**What it means:** Peer-to-peer connection failed due to network issues.

**Console logs to check:**
```
Initiator: Connection state changed to: connecting
Initiator: Connection state changed to: failed
```

**Possible causes:**

1. **Firewall blocking WebRTC**
   - Solution: Disable firewall temporarily or add exception

2. **Corporate network/VPN restrictions**
   - Solution: Test on different network (mobile hotspot)

3. **NAT traversal failed**
   - Solution: Add TURN server (currently using only STUN)

4. **ICE candidates not exchanged**
   - Check logs: Should see "Adding ICE candidate..." multiple times
   - If not: Firebase write permissions issue

**Troubleshooting steps:**
1. Open browser console on both sides
2. Look for "Connection state changed to: failed"
3. Check if ICE candidates are being added
4. Try on different network

---

### Error 4: No Video/Audio

**What it means:** Media permissions denied or stream not captured.

**Console logs to check:**
```
Error accessing media devices: NotAllowedError
Could not access camera/microphone. Please check permissions.
```

**Solution:**
1. Check browser address bar for permission prompt
2. Click and allow camera/microphone access
3. Refresh the page
4. Check browser settings → Site permissions → Camera/Microphone

---

### Error 5: "Remote track received" but no video showing

**What it means:** Track received but not attached to video element.

**Console logs to check:**
```
Initiator: Remote track received  ✅
// But video element remains black
```

**Solution:**
1. Check if video element ref is attached
2. Check if `autoPlay` attribute is set
3. Check if stream has active tracks
4. Inspect video element in browser DevTools

---

## 🧪 Testing Checklist

### Before Testing
- [ ] Both browsers have camera/microphone permissions
- [ ] Firebase configured in `.env`
- [ ] Interview scheduled between recruiter and job seeker
- [ ] Both users logged in

### Testing Steps
1. [ ] **Recruiter opens interview page first**
   - Expected: "Waiting for other participant to join..."
   - Console: Should see "Initiator: ..." logs
   - Console: Should see "Offer sent to Firebase successfully"

2. [ ] **Wait 2-3 seconds**
   - Allows offer to be written to Firebase

3. [ ] **Job seeker opens interview page second**
   - Expected: Connection establishes within 5 seconds
   - Console: Should see "Joiner: ..." logs
   - Console: Should see "Answer sent to Firebase successfully"

4. [ ] **Verify both sides see each other**
   - Local video shows your camera
   - Remote video shows other participant

5. [ ] **Test controls**
   - [ ] Camera toggle works
   - [ ] Mic toggle works
   - [ ] Screen share works
   - [ ] End call works

### If Connection Fails
1. [ ] Check console logs on BOTH sides
2. [ ] Look for error messages
3. [ ] Verify signaling states
4. [ ] Check if offer/answer were exchanged
5. [ ] Refresh both windows and try again

---

## 🔧 Debug Commands

### Check Firebase Rules
Ensure Firestore rules allow read/write to `videoRooms` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videoRooms/{roomId} {
      allow read, write: if request.auth != null;

      match /offerCandidates/{candidateId} {
        allow read, write: if request.auth != null;
      }

      match /answerCandidates/{candidateId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### Check Firebase Data (in Firebase Console)

Navigate to Firestore → `videoRooms` → `{interviewId}`

Should see:
```json
{
  "createdAt": "timestamp",
  "createdBy": "userId",
  "participants": ["userId"],
  "status": "waiting" or "connected",
  "offer": {
    "type": "offer",
    "sdp": "..."
  },
  "answer": {
    "type": "answer",
    "sdp": "..."
  }
}
```

### Check Subcollections

- `offerCandidates` - Should have multiple documents
- `answerCandidates` - Should have multiple documents

If empty: ICE candidates not being exchanged (check permissions)

---

## 🌐 Browser-Specific Issues

### Chrome/Edge
- ✅ Best support
- Works reliably
- Use for testing

### Firefox
- ⚠️ May require additional permissions
- Screen share may behave differently
- Generally works well

### Safari
- ⚠️ Limited WebRTC support
- May have issues with screen share
- Use Safari 11+ only

---

## 📱 Network Requirements

### Ports Required
- **UDP ports 49152-65535** - WebRTC media
- **TCP port 443** - Firebase signaling

### Firewall Settings
Allow outbound connections to:
- `*.googleapis.com` (Firebase)
- `stun.l.google.com:19302` (STUN server)

### VPN/Proxy
- May interfere with peer-to-peer connection
- Test without VPN if issues occur

---

## 🚀 Advanced Debugging

### Enable WebRTC Internals (Chrome)

1. Open `chrome://webrtc-internals/` in Chrome
2. Start the video call
3. Monitor connection stats in real-time
4. Look for:
   - ICE candidate gathering
   - Connection state transitions
   - Media track stats

### Check ICE Connection State

Add this to WebRTCService.js temporarily:

```javascript
this.peerConnection.oniceconnectionstatechange = () => {
  console.log('ICE connection state:', this.peerConnection.iceConnectionState);
};

this.peerConnection.onicegatheringstatechange = () => {
  console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
};
```

### Monitor Signaling State

Already logged automatically. Watch for:
- `stable` → `have-local-offer` → `stable` (Initiator)
- `stable` → `have-remote-offer` → `stable` (Joiner)

---

## 💡 Tips

1. **Always test in correct order**
   - Recruiter first (initiator)
   - Job seeker second (joiner)

2. **Use browser console**
   - Open DevTools (F12)
   - Check Console tab
   - Look for "Initiator:" or "Joiner:" logs

3. **Refresh both windows if stuck**
   - Close both browser windows
   - Start fresh: Recruiter first, wait, then job seeker

4. **Test on local network first**
   - Eliminates network complexity
   - Both users on same WiFi

5. **Check camera/mic permissions**
   - Look for browser permission prompt
   - Check browser settings

---

## 📞 Still Having Issues?

If none of the above helps, provide these details:

1. **Console logs from BOTH sides** (full logs)
2. **Browser versions** (Chrome/Firefox/Safari + version)
3. **Network setup** (home WiFi, corporate, VPN, etc.)
4. **Error messages** (exact text)
5. **Last successful step** (where did it stop?)

With this information, we can diagnose the exact issue!
