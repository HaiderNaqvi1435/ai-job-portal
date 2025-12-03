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

    // Handle remote stream
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    return this.peerConnection;
  }

  // Join or create a room
  async joinRoom(onRemoteStream, onConnectionStateChange) {
    try {
      const roomRef = doc(db, 'videoRooms', this.roomId);
      const roomSnapshot = await getDoc(roomRef);

      // If initiator joins and room exists, clean it up for fresh start
      if (this.isInitiator && roomSnapshot.exists()) {
        console.log('Initiator cleaning up existing room for fresh start');
        await this.cleanupRoom(roomRef);
      } else if (!roomSnapshot.exists()) {
        // Create room if it doesn't exist
        await this.createRoom(roomRef);
      }

      // Create peer connection
      this.createPeerConnection();

      // Listen for connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        if (onConnectionStateChange) {
          onConnectionStateChange(this.peerConnection.connectionState);
        }
      };

      // Listen for remote stream
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
        if (onRemoteStream) {
          onRemoteStream(this.remoteStream);
        }
      };

      if (this.isInitiator) {
        // Initiator creates offer
        await this.createOffer(roomRef);
        // Listen for answer
        this.listenForAnswer(roomRef);
      } else {
        // Joiner listens for offer and creates answer
        await this.listenForOfferAndAnswer(roomRef);
      }

      // Listen for ICE candidates
      this.listenForICECandidates();

    } catch (error) {
      console.error('Error joining room:', error);
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
    // Check signaling state
    if (this.peerConnection.signalingState !== 'stable') {
      console.log('Not in stable state, waiting...');
      return;
    }

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

    // Collect ICE candidates
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(collection(db, 'videoRooms', this.roomId, 'offerCandidates'), {
          candidate: event.candidate.toJSON(),
          timestamp: new Date(),
        });
      }
    };
  }

  // Listen for answer (initiator)
  listenForAnswer(roomRef) {
    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();

      // Only process answer once
      if (data?.answer && !this.answerProcessed) {
        try {
          this.answerProcessed = true;

          console.log('Processing answer from joiner...');

          // Check if we already have a remote description
          if (this.peerConnection.currentRemoteDescription) {
            console.log('Remote description already set, skipping');
            return;
          }

          // Check signaling state
          if (this.peerConnection.signalingState !== 'have-local-offer') {
            console.log('Not in correct state to receive answer, current state:', this.peerConnection.signalingState);
            this.answerProcessed = false; // Reset flag
            return;
          }

          const answer = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answer);
          console.log('Remote description (answer) set successfully');
        } catch (error) {
          console.error('Error setting remote answer:', error);
          this.answerProcessed = false; // Reset flag on error
        }
      }
    });
    this.unsubscribes.push(unsubscribe);
  }

  // Listen for offer and create answer (joiner)
  async listenForOfferAndAnswer(roomRef) {
    // Wait for a valid offer using a listener
    const unsubscribe = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();

      // Only process once and if offer exists
      if (data?.offer && data?.status === 'waiting' && !this.offerProcessed) {
        try {
          // Mark as processing to prevent duplicate processing
          this.offerProcessed = true;

          console.log('Processing offer from initiator...');

          // Only process if we're in stable state (haven't set remote description yet)
          if (this.peerConnection.signalingState !== 'stable') {
            console.log('Not in stable state, waiting...');
            this.offerProcessed = false; // Reset flag
            return;
          }

          // Set remote description (the offer)
          const offer = new RTCSessionDescription(data.offer);
          await this.peerConnection.setRemoteDescription(offer);
          console.log('Remote description (offer) set successfully');

          // Create and set local description (the answer)
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          console.log('Local description (answer) created');

          // Send answer to Firebase
          await updateDoc(roomRef, {
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
            status: 'connected',
          });

          console.log('Answer sent to Firebase');

          // Collect ICE candidates
          this.peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
              await addDoc(collection(db, 'videoRooms', this.roomId, 'answerCandidates'), {
                candidate: event.candidate.toJSON(),
                timestamp: new Date(),
              });
            }
          };

          // Stop listening once answer is sent
          unsubscribe();
        } catch (error) {
          console.error('Error in listenForOfferAndAnswer:', error);
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
