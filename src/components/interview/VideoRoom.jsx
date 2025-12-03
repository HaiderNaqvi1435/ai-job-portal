'use client';

import { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

export default function VideoRoom({ roomUrl, onLeave }) {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomUrl || !containerRef.current) return;

    // Prevent duplicate instances - destroy existing frame first
    if (callFrameRef.current) {
      callFrameRef.current.destroy();
      callFrameRef.current = null;
    }

    // Create Daily call frame
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      showLeaveButton: false,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '8px',
      },
    });

    callFrameRef.current = callFrame;

    // Event listeners
    callFrame
      .on('joined-meeting', () => {
        setIsJoined(true);
        setError('');
      })
      .on('left-meeting', () => {
        setIsJoined(false);
        if (onLeave) onLeave();
      })
      .on('error', (e) => {
        setError(e.errorMsg || 'An error occurred');
        console.error('Daily error:', e);
      })
      .on('camera-error', (e) => {
        setError('Camera access denied or unavailable');
        console.error('Camera error:', e);
      });

    // Join the room
    callFrame.join({ url: roomUrl }).catch((err) => {
      setError('Failed to join video call');
      console.error('Join error:', err);
    });

    // Cleanup
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [roomUrl, onLeave]);

  const toggleCamera = () => {
    if (!callFrameRef.current) return;
    callFrameRef.current.setLocalVideo(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (!callFrameRef.current) return;
    callFrameRef.current.setLocalAudio(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const toggleScreenShare = async () => {
    if (!callFrameRef.current) return;
    try {
      if (isScreenSharing) {
        await callFrameRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callFrameRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Failed to share screen');
    }
  };

  const leaveCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="flex-1 mb-4">
        <CardContent className="p-0 h-full min-h-[500px]">
          <div ref={containerRef} className="w-full h-full" />
        </CardContent>
      </Card>

      {isJoined && (
        <div className="flex justify-center gap-4">
          <Button
            variant={isCameraOn ? 'default' : 'destructive'}
            size="lg"
            onClick={toggleCamera}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isMicOn ? 'default' : 'destructive'}
            size="lg"
            onClick={toggleMic}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'outline'}
            size="lg"
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>

          <Button variant="destructive" size="lg" onClick={leaveCall}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
