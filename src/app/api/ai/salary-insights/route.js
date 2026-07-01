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
    const { jobTitle, location, skills } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Use mock data if no keys are configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for salary insights');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.salaryInsights);
    }

    let result;

    if (HAS_OPENAI) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a salary data analyst. Provide salary insights in JSON format:
{
  "salaryRange": {
    "min": number,
    "max": number,
    "median": number,
    "currency": "USD"
  },
  "skillDemandScore": number (0-10),
  "marketTrend": "increasing" | "stable" | "decreasing",
  "insights": string[],
  "comparison": {
    "entryLevel": number,
    "midLevel": number,
    "seniorLevel": number
  },
  "topPayingCompanies": string[],
  "recommendations": string[]
}

Base estimates on current market data and trends.`,
          },
          {
            role: 'user',
            content: `Provide salary insights for:
Job Title: ${jobTitle}
Location: ${location || 'United States'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      result = JSON.parse(completion.choices[0].message.content);
    } else if (HAS_GEMINI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const prompt = `You are a salary data analyst. Provide salary insights in JSON format:
{
  "salaryRange": {
    "min": number,
    "max": number,
    "median": number,
    "currency": "USD"
  },
  "skillDemandScore": number (0-10),
  "marketTrend": "increasing" | "stable" | "decreasing",
  "insights": string[],
  "comparison": {
    "entryLevel": number,
    "midLevel": number,
    "seniorLevel": number
  },
  "topPayingCompanies": string[],
  "recommendations": string[]
}

Base estimates on current market data and trends.

Provide salary insights for:
Job Title: ${jobTitle}
Location: ${location || 'United States'}
Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      result = JSON.parse(cleanedText);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Salary insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get salary insights' },
      { status: 500 }
    );
  }
}
