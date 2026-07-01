import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mockData from '@/lib/mock-data/ai-responses.json';

const HAS_OPENAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your_openai_api_key';
const HAS_GEMINI = !!process.env.GEMINI_API_KEY;
const USE_MOCK_DATA = !HAS_OPENAI && !HAS_GEMINI;

const openai = HAS_OPENAI ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const genAI = HAS_GEMINI ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    // Use mock data if no keys are configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for ATS optimization');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.atsOptimization);
    }

    let result;

    if (HAS_OPENAI) {
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

      result = JSON.parse(completion.choices[0].message.content);
    } else if (HAS_GEMINI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const prompt = `You are an ATS (Applicant Tracking System) optimization expert. Compare the resume with the job description and return a JSON response with:
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
}

Job Description:
${jobDescription}

Resume:
${resumeText}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      result = JSON.parse(cleanedText);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ATS optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize for ATS' },
      { status: 500 }
    );
  }
}
