# Quick WebRTC Testing Guide

## 🎯 Testing Order (CRITICAL!)

### Step 1: Recruiter Opens First
1. Open browser 1 (e.g., Chrome normal window)
2. Login as **recruiter**
3. Go to: Dashboard → Interviews
4. Click on any interview
5. **WAIT 5 SECONDS** - This is crucial!
6. You should see your camera and "Waiting for other participant..."

### Step 2: Job Seeker Opens Second
1. Open browser 2 (e.g., Chrome incognito window OR different browser like Firefox)
2. Login as **job seeker**
3. Go to: Dashboard → Interviews
4. Click on the **SAME** interview
5. Connection should establish in 3-5 seconds
6. You should see both video feeds

---

## 📋 What to Check

### Recruiter Browser Console (F12)
Look for these logs:
```
✅ Initiator: Joining room ...
✅ Initiator: Creating offer and listening for answer
✅ Creating offer...
✅ Offer sent to Firebase successfully
✅ Initiator: Answer received from joiner
✅ Initiator: Remote description (answer) set successfully
✅ Initiator: Connection state changed to: connected
```

### Job Seeker Browser Console (F12)
Look for these logs:
```
✅ Joiner: Joining room ...
✅ Joiner: Starting to listen for offer...
✅ Joiner: Offer received from initiator
✅ Joiner: Remote description (offer) set successfully
✅ Joiner: Answer sent to Firebase successfully
✅ Joiner: Connection state changed to: connected
```

---

## ❌ Common Issues

### Issue 1: "The SDP does not match..."
**Fix:**
1. Close both browser windows
2. Recruiter opens first, wait 5 seconds
3. Job seeker opens second

### Issue 2: Connection never establishes
**Fix:**
1. Check browser console for errors
2. Verify both cameras are allowed
3. Try on different network (e.g., mobile hotspot)

### Issue 3: "Waiting for participant..." forever
**Fix:**
1. Make sure you opened in correct order (Recruiter → Job Seeker)
2. Wait at least 5 seconds between opening
3. Check Firebase console for data

---

## 🔍 Verify Firebase Data

### Check Firebase Console
1. Go to: https://console.firebase.google.com
2. Select project: `ai-job-portal-8b8ff`
3. Navigate to: Firestore Database → videoRooms
4. Find your interview ID
5. Should see:
   ```
   offer: { type: "offer", sdp: "..." }
   answer: { type: "answer", sdp: "..." }
   status: "connected"
   ```

---

## 🚀 If Everything Fails

### Complete Reset
1. **Close all browser windows**
2. **Clear browser cache** (Ctrl + Shift + Delete)
3. **Restart browser**
4. **Recruiter opens first**, wait 5 seconds, check console
5. **Job seeker opens second**, check console
6. **Report console logs from both sides** if still failing

---

## 📞 No API Keys Needed

WebRTC implementation is **completely free**:
- ✅ Firebase Firestore for signaling (free tier)
- ✅ Google STUN servers (free)
- ✅ Peer-to-peer video (no server cost)

**Total cost: $0** 🎉

---

## 💡 Tips

1. **Always use correct order**: Recruiter first, then job seeker
2. **Wait 5 seconds**: Between opening recruiter and job seeker
3. **Check console logs**: Open DevTools (F12) on both sides
4. **Allow camera/mic**: Look for browser permission prompt
5. **Same interview**: Make sure both users join the same interview ID

---

## 📝 Expected Console Output (Full Flow)

### Recruiter Console
```javascript
Initiator: Joining room abc123
Initiator: Room exists: true
Initiator: Cleaning up existing room for fresh start
Initiator: Creating peer connection
Initiator: Creating offer and listening for answer
Initiator: Starting to listen for ICE candidates
Initiator: Room join setup complete
Creating offer...
Offer created, sending to Firebase
Offer sent to Firebase successfully
Initiator: Starting to listen for answer...
Initiator: Answer received from joiner
Initiator: Current signaling state: have-local-offer
Initiator: Setting remote description (answer)...
Initiator: Remote description (answer) set successfully
Initiator: Final signaling state: stable
Initiator: Connection state changed to: connecting
Initiator: Connection state changed to: connected
Initiator: Remote track received
```

### Job Seeker Console
```javascript
Joiner: Joining room abc123
Joiner: Room exists: true
Joiner: Creating peer connection
Joiner: Listening for offer to create answer
Joiner: Starting to listen for ICE candidates
Joiner: Room join setup complete
Joiner: Starting to listen for offer...
Joiner: Offer received from initiator
Joiner: Current signaling state: stable
Joiner: Setting remote description (offer)...
Joiner: Remote description (offer) set successfully
Joiner: New signaling state after setRemoteDescription: have-remote-offer
Joiner: Creating answer...
Joiner: Local description (answer) created and set
Joiner: Final signaling state: stable
Joiner: Sending answer to Firebase...
Joiner: Answer sent to Firebase successfully
Joiner: Connection state changed to: connecting
Joiner: Connection state changed to: connected
Joiner: Remote track received
Joiner: Adding ICE candidate...
```

---

## ✅ Success Criteria

- [ ] Recruiter sees their own video
- [ ] Job seeker sees their own video
- [ ] Recruiter sees job seeker's video
- [ ] Job seeker sees recruiter's video
- [ ] Both see "Connected" status
- [ ] No errors in console

**If all checked: SUCCESS! 🎉**

---

## 🐛 Still Having Issues?

Copy and paste the **entire console output** from both browsers and provide:
1. Browser versions (Chrome 120, Firefox 115, etc.)
2. Network type (home WiFi, corporate, VPN, etc.)
3. At which step it fails
