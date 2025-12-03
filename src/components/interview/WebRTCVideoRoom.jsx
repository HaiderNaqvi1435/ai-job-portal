'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import { WebRTCService } from '@/lib/webrtc/WebRTCService';
import { useAuthStore } from '@/store/useAuthStore';

export default function WebRTCVideoRoom({ roomId, isInitiator = false, onLeave }) {
  const { user } = useAuthStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const webrtcServiceRef = useRef(null);

  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState('');
  const [connectionState, setConnectionState] = useState('new');

  useEffect(() => {
    if (!roomId || !user?.uid) return;

    const initializeCall = async () => {
      try {
        setError('');
        setIsConnecting(true);

        // Create WebRTC service
        webrtcServiceRef.current = new WebRTCService(roomId, user.uid, isInitiator);

        // Initialize local media
        const localStream = await webrtcServiceRef.current.initializeMedia();

        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Join room with callbacks
        await webrtcServiceRef.current.joinRoom(
          // On remote stream
          (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          },
          // On connection state change
          (state) => {
            setConnectionState(state);
            if (state === 'connected') {
              setIsConnected(true);
              setIsConnecting(false);
            } else if (state === 'disconnected' || state === 'failed') {
              setIsConnected(false);
              setError('Connection lost. Please refresh and try again.');
            }
          }
        );

        setIsConnecting(false);
      } catch (err) {
        console.error('Error initializing call:', err);
        setError(err.message || 'Failed to initialize video call');
        setIsConnecting(false);
      }
    };

    initializeCall();

    // Cleanup
    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.leaveRoom();
      }
    };
  }, [roomId, user?.uid, isInitiator]);

  const toggleCamera = () => {
    if (webrtcServiceRef.current) {
      const enabled = webrtcServiceRef.current.toggleVideo();
      setIsCameraOn(enabled);
    }
  };

  const toggleMic = () => {
    if (webrtcServiceRef.current) {
      const enabled = webrtcServiceRef.current.toggleAudio();
      setIsMicOn(enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!webrtcServiceRef.current) return;

    try {
      if (isScreenSharing) {
        await webrtcServiceRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        const success = await webrtcServiceRef.current.shareScreen();
        if (success) {
          setIsScreenSharing(true);
        } else {
          setError('Failed to share screen');
        }
      }
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Failed to share screen');
    }
  };

  const leaveCall = async () => {
    if (webrtcServiceRef.current) {
      await webrtcServiceRef.current.leaveRoom();
    }
    if (onLeave) {
      onLeave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isConnecting && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Connecting to video call...</span>
          </div>
        </div>
      )}

      {!isConnected && !isConnecting && !error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          Waiting for other participant to join...
        </div>
      )}

      {isConnected && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Connected • {connectionState}
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-1">
        {/* Local Video */}
        <Card className="relative overflow-hidden bg-gray-900">
          <CardContent className="p-0 h-full min-h-[300px] md:min-h-[400px]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
              You {!isCameraOn && '(Camera Off)'}
            </div>
          </CardContent>
        </Card>

        {/* Remote Video */}
        <Card className="relative overflow-hidden bg-gray-900">
          <CardContent className="p-0 h-full min-h-[300px] md:min-h-[400px]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
              Other Participant
            </div>
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Waiting for participant...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant={isCameraOn ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleCamera}
          disabled={isConnecting}
        >
          {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isMicOn ? 'default' : 'destructive'}
          size="lg"
          onClick={toggleMic}
          disabled={isConnecting}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'outline'}
          size="lg"
          onClick={toggleScreenShare}
          disabled={isConnecting || !isConnected}
        >
          {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>

        <Button variant="destructive" size="lg" onClick={leaveCall}>
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
