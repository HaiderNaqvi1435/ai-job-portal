import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mockData from '@/lib/mock-data/ai-responses.json';

const USE_MOCK_DATA = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your_openai_api_key';

const openai = USE_MOCK_DATA ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // Use mock data if OpenAI key is not configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for skill gap analysis');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.skillGapAnalysis);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a career development expert specializing in skill gap analysis. Analyze the candidate's resume against the job requirements and return a JSON response with:
{
  "fitScore": number (0-100),
  "skillsFound": string[],
  "skillsMissing": string[],
  "weakSkills": string[],
  "recommendedCourses": Array<{
    "skill": string,
    "course": string,
    "platform": string,
    "estimatedTime": string
  }>,
  "improvementTips": string[],
  "marketDemand": {
    "score": number (0-10),
    "trend": "increasing" | "stable" | "decreasing"
  }
}`,
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill gap' },
      { status: 500 }
    );
  }
}
