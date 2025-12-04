# Video Not Showing - Debug Steps

## 🔍 Current Status

✅ Connection established: "Connected • connected"
✅ Remote tracks received (audio + video)
❌ Remote video not visible
❌ Remote audio not audible

---

## 🐛 Possible Causes & Fixes

### 1. Video Element Not Playing

**Check in console:**
- Do you see: `React: Remote video playing successfully`?
- Or: `Error playing remote video`?

**If you see an error:**
- Browser might be blocking autoplay
- Need user interaction to start video

**Fix applied:**
- Explicit `video.play()` call
- Fallback to muted play if blocked

---

### 2. Tracks Disabled or Muted

**Check in console for:**
```
Track state - enabled: true/false, muted: true/false, readyState: live/ended
```

**If enabled: false or readyState: ended:**
- Track is disabled on sender side
- Check sender's camera/mic permissions

**If muted: true:**
- Track is temporarily muted
- Should still show video (frozen frame)

---

### 3. Stream Has No Active Tracks

**Check in console:**
```
React: Remote stream has tracks: 2
Remote stream status - Audio: true, Video: true, Total tracks: 2
```

**If Total tracks: 0 or missing tracks:**
- Stream not building correctly
- Need to reinitialize

---

### 4. Video Element Not Receiving Stream

**Check in Browser DevTools:**
1. Open DevTools (F12)
2. Go to Elements tab
3. Find the remote video element
4. Check if `srcObject` is set
5. Check if video has `videoWidth` and `videoHeight`

**If srcObject is null:**
- React ref not attached properly

**If videoWidth/videoHeight are 0:**
- Stream has no active video track

---

## 🧪 Testing Steps

### Step 1: Check Console Logs

Look for these specific logs when connection establishes:

**On Recruiter Side:**
```javascript
✅ Initiator: Remote track received (kind: audio)
✅ Initiator: Adding new audio track
✅ Initiator: Track state - enabled: true, muted: false, readyState: live
✅ Initiator: Remote track received (kind: video)
✅ Initiator: Adding new video track
✅ Initiator: Track state - enabled: true, muted: false, readyState: live
✅ Initiator: Remote stream status - Audio: true, Video: true, Total tracks: 2
✅ React: Remote stream has tracks: 2
✅ React: Track - kind: audio, enabled: true, readyState: live
✅ React: Track - kind: video, enabled: true, readyState: live
✅ React: Remote video playing successfully
```

**On Job Seeker Side:**
```javascript
✅ Joiner: Remote track received (kind: audio)
✅ Joiner: Adding new audio track
✅ Joiner: Track state - enabled: true, muted: false, readyState: live
✅ Joiner: Remote track received (kind: video)
✅ Joiner: Adding new video track
✅ Joiner: Track state - enabled: true, muted: false, readyState: live
✅ Joiner: Remote stream status - Audio: true, Video: true, Total tracks: 2
✅ React: Remote stream has tracks: 2
✅ React: Track - kind: audio, enabled: true, readyState: live
✅ React: Track - kind: video, enabled: true, readyState: live
✅ React: Remote video playing successfully
```

---

### Step 2: Inspect Video Element

**In Browser DevTools:**

1. Right-click on the black remote video area
2. Select "Inspect" or "Inspect Element"
3. Find the `<video>` element for remote participant
4. Check these properties in the Elements panel:

```html
<video
  autoplay=""
  playsinline=""
  class="..."
>
```

**In Console, run:**
```javascript
// Get the remote video element
const remoteVideo = document.querySelectorAll('video')[1]; // Second video is remote

// Check properties
console.log('srcObject:', remoteVideo.srcObject);
console.log('srcObject tracks:', remoteVideo.srcObject?.getTracks());
console.log('paused:', remoteVideo.paused);
console.log('muted:', remoteVideo.muted);
console.log('videoWidth:', remoteVideo.videoWidth);
console.log('videoHeight:', remoteVideo.videoHeight);
console.log('readyState:', remoteVideo.readyState);

// Try to play manually
remoteVideo.play().then(() => console.log('Playing!')).catch(e => console.error(e));
```

---

### Step 3: Check Both Participants' Cameras

**Important:** Make sure BOTH participants granted camera/mic permissions!

**On Recruiter side:**
- Check local video shows your camera ✅
- This confirms your camera is working

**On Job Seeker side:**
- Check local video shows your camera ✅
- This confirms your camera is working

**If local video works but remote doesn't:**
- WebRTC connection is fine
- Issue is with video playback, not connection

---

## 🔧 Quick Fixes to Try

### Fix 1: Refresh and Retry
1. Close both browser windows
2. Clear browser cache (Ctrl+Shift+Delete)
3. Recruiter opens first, wait 5 seconds
4. Job seeker opens second
5. Check console logs for track states

---

### Fix 2: Check Browser Permissions
1. Click the lock icon in address bar
2. Check Camera and Microphone permissions
3. Make sure both are "Allowed"
4. Refresh if you changed permissions

---

### Fix 3: Try Different Browser
- Test with Chrome (best WebRTC support)
- Test with Edge (Chromium-based)
- Avoid Safari (limited WebRTC support)

---

### Fix 4: Manual Video Play (Debug)

If video element exists but not playing, run this in console:

```javascript
// Get all video elements
const videos = document.querySelectorAll('video');

// Remote video should be the second one
const remoteVideo = videos[1];

// Check if it has a stream
console.log('Has stream:', !!remoteVideo.srcObject);
console.log('Stream tracks:', remoteVideo.srcObject?.getTracks().map(t => ({
  kind: t.kind,
  enabled: t.enabled,
  muted: t.muted,
  readyState: t.readyState
})));

// Force play
remoteVideo.play()
  .then(() => console.log('Video started playing'))
  .catch(err => console.error('Cannot play:', err));
```

---

## 📊 Expected vs Actual

### Expected Behavior:
1. ✅ Local video shows your camera
2. ✅ Remote video shows other participant's camera
3. ✅ Can hear other participant (if audio enabled)
4. ✅ Both see "Connected" banner

### Current Behavior:
1. ✅ Local video shows your camera
2. ❌ Remote video is black/empty
3. ❌ Cannot hear other participant
4. ✅ Both see "Connected" banner

### This suggests:
- WebRTC connection is working (Connected banner)
- Media capture is working (local video)
- **Issue:** Remote stream playback in video element

---

## 🚀 Next Steps

**After refreshing and testing again:**

1. **Share these logs:**
   - Track state logs (enabled, muted, readyState)
   - Video element properties (videoWidth, videoHeight, readyState)
   - Any error messages

2. **Share screenshot showing:**
   - Both video panels (local and remote)
   - Browser console with logs
   - DevTools Elements tab showing video element

3. **Test this command in console:**
   ```javascript
   document.querySelectorAll('video')[1].play()
   ```
   - Does it make the video appear?
   - What error (if any) do you get?

With this information, I can identify exactly why the video isn't displaying!
