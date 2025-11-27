import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mockData from '@/lib/mock-data/ai-responses.json';

const USE_MOCK_DATA = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your_openai_api_key';

const openai = USE_MOCK_DATA ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Use mock data if OpenAI key is not configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for resume analysis');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.resumeAnalysis);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume analyzer. Analyze the provided resume and return a JSON response with the following structure:
{
  "score": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "skills": string[],
  "experience": {
    "years": number,
    "level": "entry" | "mid" | "senior" | "lead"
  },
  "suggestions": string[],
  "rewrittenSummary": string
}

Provide detailed, actionable feedback.`,
        },
        {
          role: 'user',
          content: `Analyze this resume:\n\n${resumeText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
