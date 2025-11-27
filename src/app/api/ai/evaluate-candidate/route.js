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
      console.log('Using mock data for candidate evaluation');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.candidateEvaluation);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert recruiter evaluating candidates. Analyze the candidate's resume against the job requirements and provide a comprehensive evaluation in JSON format:
{
  "overallScore": number (0-100),
  "matchScore": number (0-100),
  "experienceScore": number (0-100),
  "skillsScore": number (0-100),
  "strengths": string[],
  "concerns": string[],
  "recommendation": "strongly_recommend" | "recommend" | "maybe" | "not_recommend",
  "summary": string,
  "interviewQuestions": string[],
  "skillGaps": string[]
}

Be objective and thorough in your evaluation.`,
        },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nCandidate Resume:\n${resumeText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Candidate evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate candidate' },
      { status: 500 }
    );
  }
}
