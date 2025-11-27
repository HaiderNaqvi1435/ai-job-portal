import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { jobTitle, location, skills } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

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

    const result = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Salary insights error:', error);
    return NextResponse.json(
      { error: 'Failed to get salary insights' },
      { status: 500 }
    );
  }
}
