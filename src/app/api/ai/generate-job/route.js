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
    const { jobTitle, companyIndustry, experienceLevel, keySkills, location, employmentType } = await request.json();

    if (!jobTitle || !companyIndustry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, company industry, and experience level are required' },
        { status: 400 }
      );
    }

    // Use mock data if no keys are configured
    if (USE_MOCK_DATA) {
      console.log('Using mock data for job generation');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockData.jobGeneration);
    }

    let result;

    if (HAS_OPENAI) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert HR professional and job description writer. Generate a comprehensive, professional job posting with the following structure in JSON format:
{
  "title": string,
  "description": string,
  "responsibilities": string[],
  "requirements": string[],
  "skills": string[],
  "benefits": string[],
  "salaryRange": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "qualifications": string[]
}

Make it professional, engaging, and ATS-friendly.`,
          },
          {
            role: 'user',
            content: `Generate a job description for:
Job Title: ${jobTitle}
Industry: ${companyIndustry}
Experience Level: ${experienceLevel}
Key Skills: ${keySkills}
Location: ${location}
Employment Type: ${employmentType}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      result = JSON.parse(completion.choices[0].message.content);
    } else if (HAS_GEMINI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `You are an expert HR professional and job description writer. Generate a comprehensive, professional job posting with the following structure in JSON format:
{
  "title": string,
  "description": string,
  "responsibilities": string[],
  "requirements": string[],
  "skills": string[],
  "benefits": string[],
  "salaryRange": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "qualifications": string[]
}

Make it professional, engaging, and ATS-friendly.

Generate a job description for:
Job Title: ${jobTitle}
Industry: ${companyIndustry}
Experience Level: ${experienceLevel}
Key Skills: ${keySkills}
Location: ${location}
Employment Type: ${employmentType}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      result = JSON.parse(cleanedText);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Job generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    );
  }
}
