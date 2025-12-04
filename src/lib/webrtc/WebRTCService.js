import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

// STUN servers for NAT traversal (free Google STUN servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCService {
  constructor(roomId, userId, isInitiator = false) {
    this.roomId = roomId;
    this.userId = userId;
    this.isInitiator = isInitiator;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.unsubscribes = [];
    this.offerProcessed = false; // Track if offer has been processed
    this.answerProcessed = false; // Track if answer has been processed
    this.remoteStreamCallbackCalled = false; // Track if remote stream callback was called
  }

  // Initialize local media (camera and microphone)
  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone. Please check permissions.');
    }
  }

  // Create peer connection
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Initialize remote stream
    this.remoteStream = new MediaStream();
    // Note: ontrack handler will be set in joinRoom()

    return this.peerConnection;
  }

  // Join or create a room
  async joinRoom(onRemoteStream, onConnectionStateChange) {
    try {
      console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Joining room ${this.roomId}`);

      const roomRef = doc(db, 'videoRooms', this.roomId);
      const roomSnapshot = await getDoc(roomRef);

      console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Room exists:`, roomSnapshot.exists());

      // If initiator joins and room exists, clean it up for fresh start
      if (this.isInitiator && roomSnapshot.exists()) {
        console.log('Initiator: Cleaning up existing room for fresh start');
        await this.cleanupRoom(roomRef);
      } else if (!roomSnapshot.exists()) {
        // Create room if it doesn't exist
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Creating new room`);
        await this.createRoom(roomRef);
      }

      // Create peer connection
      console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Creating peer connection`);
      this.createPeerConnection();

      // Listen for connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Connection state changed to:`, this.peerConnection.connectionState);
        if (onConnectionStateChange) {
          onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Also listen to ICE connection state for more detailed status
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: ICE connection state:`, this.peerConnection.iceConnectionState);

        // Treat 'connected' or 'completed' ICE state as fully connected
        if (this.peerConnection.iceConnectionState === 'connected' ||
            this.peerConnection.iceConnectionState === 'completed') {
          console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: ICE connection established!`);
          if (onConnectionStateChange) {
            onConnectionStateChange('connected');
          }
        }
      };

      // Listen for ICE gathering state
      this.peerConnection.onicegatheringstatechange = () => {
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: ICE gathering state:`, this.peerConnection.iceGatheringState);
      };

      // Listen for remote stream - USE STREAM FROM EVENT DIRECTLY
      this.peerConnection.ontrack = (event) => {
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Remote track received (kind: ${event.track.kind})`);
        console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Track state - enabled: ${event.track.enabled}, muted: ${event.track.muted}, readyState: ${event.track.readyState}`);

        // Use the stream directly from the event - this is the most reliable way
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Using stream from event, tracks:`, stream.getTracks().length);

          // Store reference to the stream
          this.remoteStream = stream;

          // Call callback immediately for each track (video element will handle it properly with autoPlay)
          if (onRemoteStream && !this.remoteStreamCallbackCalled) {
            this.remoteStreamCallbackCalled = true;
            console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Calling onRemoteStream with event stream`);
            onRemoteStream(stream);
          }

          // Check if we have both tracks for connected state
          const hasAudio = stream.getAudioTracks().length > 0;
          const hasVideo = stream.getVideoTracks().length > 0;
          console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Stream status - Audio: ${hasAudio}, Video: ${hasVideo}`);

          if (hasAudio && hasVideo) {
            console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Both tracks present, triggering connected state`);
            if (onConnectionStateChange) {
              onConnectionStateChange('connected');
            }
          }
        }
      };

      if (this.isInitiator) {
        console.log('Initiator: Creating offer and listening for answer');
        // Initiator creates offer
        await this.createOffer(roomRef);
        // Listen for answer
        this.listenForAnswer(roomRef);
      } else {
        console.log('Joiner: Listening for offer to create answer');
        // Joiner listens for offer and creates answer
        await this.listenForOfferAndAnswer(roomRef);
      }

      // Listen for ICE candidates
      console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Starting to listen for ICE candidates`);
      this.listenForICECandidates();

      console.log(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Room join setup complete`);

    } catch (error) {
      console.error(`${this.isInitiator ? 'Initiator' : 'Joiner'}: Error joining room:`, error);
      throw error;
    }
  }

  // Create room in Firebase
  async createRoom(roomRef) {
    await setDoc(roomRef, {
      createdAt: new Date(),
      createdBy: this.userId,
      participants: [this.userId],
      status: 'waiting',
    });
  }

  // Clean up room data
  async cleanupRoom(roomRef) {
    try {
      // Delete offer and answer candidates
      const offerCandidatesRef = collection(db, 'videoRooms', this.roomId, 'offerCandidates');
      const answerCandidatesRef = collection(db, 'videoRooms', this.roomId, 'answerCandidates');

      const offerSnapshot = await getDocs(offerCandidatesRef);
      const answerSnapshot = await getDocs(answerCandidatesRef);

      // Delete all candidates
      const deletePromises = [];
      offerSnapshot.docs.forEach((docSnap) => deletePromises.push(deleteDoc(docSnap.ref)));
      answerSnapshot.docs.forEach((docSnap) => deletePromises.push(deleteDoc(docSnap.ref)));

      await Promise.all(deletePromises);

      // Reset room data
      await setDoc(roomRef, {
        createdAt: new Date(),
        createdBy: this.userId,
        participants: [this.userId],
        status: 'waiting',
      }, { merge: false }); // Use merge: false to completely replace
    } catch (error) {
      console.error('Error cleaning up room:', error);
    }
  }

  // Create offer (initiator)
  async createOffer(roomRef) {
    try {
      // Check if offer already created
      if (this.peerConnection.localDescription) {
        console.log('Offer already created, skipping...');
        return;
      }

      // Check signaling state
      if (this.peerConnection.signalingState !== 'stable') {
        console.log('Not in stable state for offer creation, current state:', this.peerConnection.signalingState);
        return;
      }

      console.log('Creating offer...');
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log('Offer created, sending to Firebase');

      await setDoc(roomRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        status: 'waiting', // Signal that offer is ready
      }, { merge: true });

      console.log('Offer sent to Firebase successfully');

      // Collect ICE candidates
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await addDoc(collection(db, 'videoRooms', this.roomId, 'offerCandidates'), {
              candidate: event.candidate.toJSON(),
              timestamp: new Date(),
            });
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      };
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Listen for answer (initiator)
  listenForAnswer(roomRef) {
    console.log('Initiator: Starting to listen for answer...');

    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();

      // Only process answer once
      if (data?.answer && !this.answerProcessed) {
        try {
          this.answerProcessed = true;

          console.log('Initiator: Answer received from joiner');
          console.log('Initiator: Current signaling state:', this.peerConnection.signalingState);
          console.log('Initiator: Current remote description:', this.peerConnection.currentRemoteDescription ? 'exists' : 'none');

          // Check if we already have a remote description
          if (this.peerConnection.currentRemoteDescription) {
            console.log('Initiator: Remote description already set, skipping');
            return;
          }

          // Check signaling state
          if (this.peerConnection.signalingState !== 'have-local-offer') {
            console.log('Initiator: Not in correct state to receive answer, current state:', this.peerConnection.signalingState);
            this.answerProcessed = false; // Reset flag
            return;
          }

          console.log('Initiator: Setting remote description (answer)...');
          const answer = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answer);
          console.log('Initiator: Remote description (answer) set successfully');
          console.log('Initiator: Final signaling state:', this.peerConnection.signalingState);
        } catch (error) {
          console.error('Initiator: Error setting remote answer:', error);
          this.answerProcessed = false; // Reset flag on error
        }
      }
    });
    this.unsubscribes.push(unsubscribe);
  }

  // Listen for offer and create answer (joiner)
  async listenForOfferAndAnswer(roomRef) {
    console.log('Joiner: Starting to listen for offer...');

    // Wait for a valid offer using a listener
    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();

      // Only process once and if offer exists
      if (data?.offer && data?.status === 'waiting' && !this.offerProcessed) {
        try {
          // Mark as processing to prevent duplicate processing
          this.offerProcessed = true;

          console.log('Joiner: Offer received from initiator');
          console.log('Joiner: Current signaling state:', this.peerConnection.signalingState);
          console.log('Joiner: Current local description:', this.peerConnection.localDescription ? 'exists' : 'none');
          console.log('Joiner: Current remote description:', this.peerConnection.remoteDescription ? 'exists' : 'none');

          // Check if we already have a local description (answer)
          if (this.peerConnection.localDescription) {
            console.log('Joiner: Answer already created, skipping...');
            unsubscribe();
            return;
          }

          // Only process if we're in stable state (haven't set remote description yet)
          if (this.peerConnection.signalingState !== 'stable') {
            console.log('Joiner: Not in stable state, waiting... Current state:', this.peerConnection.signalingState);
            this.offerProcessed = false; // Reset flag
            return;
          }

          console.log('Joiner: Setting remote description (offer)...');
          // Set remote description (the offer)
          const offer = new RTCSessionDescription(data.offer);
          await this.peerConnection.setRemoteDescription(offer);
          console.log('Joiner: Remote description (offer) set successfully');
          console.log('Joiner: New signaling state after setRemoteDescription:', this.peerConnection.signalingState);

          console.log('Joiner: Creating answer...');
          // Create and set local description (the answer)
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          console.log('Joiner: Local description (answer) created and set');
          console.log('Joiner: Final signaling state:', this.peerConnection.signalingState);

          console.log('Joiner: Sending answer to Firebase...');
          // Send answer to Firebase
          await updateDoc(roomRef, {
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
            status: 'connected',
          });

          console.log('Joiner: Answer sent to Firebase successfully');

          // Collect ICE candidates
          this.peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
              try {
                console.log('Joiner: Adding ICE candidate...');
                await addDoc(collection(db, 'videoRooms', this.roomId, 'answerCandidates'), {
                  candidate: event.candidate.toJSON(),
                  timestamp: new Date(),
                });
              } catch (error) {
                console.error('Joiner: Error adding ICE candidate:', error);
              }
            }
          };

          // Stop listening once answer is sent
          unsubscribe();
        } catch (error) {
          console.error('Joiner: Error in listenForOfferAndAnswer:', error);
          this.offerProcessed = false; // Reset flag on error
        }
      }
    });

    this.unsubscribes.push(unsubscribe);
  }

  // Listen for ICE candidates
  listenForICECandidates() {
    // Listen for offer candidates (if we're the answerer)
    if (!this.isInitiator) {
      const offerCandidatesQuery = collection(db, 'videoRooms', this.roomId, 'offerCandidates');
      const unsubscribe = onSnapshot(offerCandidatesQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            try {
              const candidate = new RTCIceCandidate(change.doc.data().candidate);
              if (this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(candidate);
              }
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        });
      });
      this.unsubscribes.push(unsubscribe);
    }

    // Listen for answer candidates (if we're the offerer)
    if (this.isInitiator) {
      const answerCandidatesQuery = collection(db, 'videoRooms', this.roomId, 'answerCandidates');
      const unsubscribe = onSnapshot(answerCandidatesQuery, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            try {
              const candidate = new RTCIceCandidate(change.doc.data().candidate);
              if (this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(candidate);
              }
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
          }
        });
      });
      this.unsubscribes.push(unsubscribe);
    }
  }

  // Toggle video
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Toggle audio
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Share screen
  async shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track with screen share track
      const sender = this.peerConnection
        .getSenders()
        .find((s) => s.track?.kind === 'video');

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      // When screen sharing stops, switch back to camera
      screenTrack.onended = () => {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      };

      return true;
    } catch (error) {
      console.error('Error sharing screen:', error);
      return false;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    try {
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection
        .getSenders()
        .find((s) => s.track?.kind === 'video');

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
      return true;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      return false;
    }
  }

  // Leave room and cleanup
  async leaveRoom() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Unsubscribe from Firebase listeners
    this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    this.unsubscribes = [];

    // Clean up streams
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
  }
}

export default WebRTCService;
