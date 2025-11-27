import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { jobTitle, companyIndustry, experienceLevel, keySkills, location, employmentType } = await request.json();

    if (!jobTitle || !companyIndustry || !experienceLevel) {
      return NextResponse.json(
        { error: 'Job title, company industry, and experience level are required' },
        { status: 400 }
      );
    }

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

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Job generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    );
  }
}
