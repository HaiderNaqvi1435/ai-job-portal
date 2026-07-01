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
    const { resumeText } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Use mock data if no keys are configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for resume analysis');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.resumeAnalysis);
    }

    let analysis;

    if (HAS_OPENAI) {
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

      analysis = JSON.parse(completion.choices[0].message.content);
    } else if (HAS_GEMINI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `You are an expert resume analyzer. Analyze the provided resume and return a JSON response with the following structure:
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

Provide detailed, actionable feedback.

Analyze this resume:

${resumeText}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      analysis = JSON.parse(cleanedText);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
