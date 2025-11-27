import { NextResponse } from 'next/server';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(request) {
  try {
    const { applicationId, jobId } = await request.json();

    if (!applicationId || !jobId) {
      return NextResponse.json(
        { error: 'Application ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Check if Daily API key is configured
    if (!DAILY_API_KEY || DAILY_API_KEY === 'your-daily-api-key') {
      // Return a mock room URL for development
      const mockRoomUrl = `https://mock.daily.co/interview-${applicationId}-${Date.now()}`;
      return NextResponse.json({
        url: mockRoomUrl,
        name: `interview-${applicationId}`,
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        message: 'Mock room created. Configure DAILY_API_KEY in .env for real video calls.',
      });
    }

    // Create a Daily.co room
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `interview-${applicationId}-${Date.now()}`,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'local',
          max_participants: 10,
          exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create room');
    }

    const room = await response.json();

    return NextResponse.json({
      url: room.url,
      name: room.name,
      expires: new Date(room.config.exp * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}
