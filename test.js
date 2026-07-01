const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDAqMrrSdxbIK5iSH6A1sYQzjQOYc8sTKg');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert HR professional and job description writer. Generate a comprehensive, professional job posting with the following structure in JSON format:
{
  "title": "string",
  "description": "string",
  "responsibilities": ["string"],
  "requirements": ["string"],
  "skills": ["string"],
  "benefits": ["string"],
  "salaryRange": {
    "min": 0,
    "max": 0,
    "currency": "USD"
  },
  "qualifications": ["string"]
}

Make it professional, engaging, and ATS-friendly.

Generate a job description for:
Job Title: Software Engineer
Industry: Tech
Experience Level: Mid-level
Key Skills: React, Node.js
Location: Remote
Employment Type: Full-time`;

    console.log("Generating...");
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    console.log('RAW RESPONSE:', text);
    const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
    console.log('CLEANED TEXT:', cleanedText);
    const result = JSON.parse(cleanedText);
    console.log('PARSED:', result);
  } catch (error) {
    console.error('ERROR:', error);
  }
}
test();
