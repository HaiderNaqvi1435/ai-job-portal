import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an ATS (Applicant Tracking System) optimization expert. Compare the resume with the job description and return a JSON response with:
{
  "atsScore": number (0-100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "recommendations": string[],
  "optimizedResume": string,
  "keywordDensity": {
    "current": number,
    "recommended": number
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
    console.error('ATS optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize for ATS' },
      { status: 500 }
    );
  }
}
