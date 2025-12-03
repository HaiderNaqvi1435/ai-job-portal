import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (if not already initialized)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

export async function POST(request) {
  try {
    const { applicationId, jobId, interviewId } = await request.json();

    if (!applicationId || !jobId) {
      return NextResponse.json(
        { error: 'Application ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Generate unique room ID
    const roomId = interviewId || `interview-${applicationId}-${Date.now()}`;

    // Create room document in Firebase (for WebRTC signaling)
    await adminDb.collection('videoRooms').doc(roomId).set({
      applicationId,
      jobId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      participants: [],
      status: 'waiting',
    });

    return NextResponse.json({
      roomId,
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      message: 'WebRTC room created successfully using Firebase',
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}
