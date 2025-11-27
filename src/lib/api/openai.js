// OpenAI API helper functions
export async function analyzeResume(resumeText) {
  try {
    const response = await fetch('/api/ai/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

export async function optimizeForATS(resumeText, jobDescription) {
  try {
    const response = await fetch('/api/ai/ats-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (!response.ok) {
      throw new Error('Failed to optimize for ATS');
    }

    return await response.json();
  } catch (error) {
    console.error('Error optimizing for ATS:', error);
    throw error;
  }
}

export async function analyzeSkillGap(resumeText, jobDescription) {
  try {
    const response = await fetch('/api/ai/skill-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze skill gap');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    throw error;
  }
}

export async function generateJobDescription(jobData) {
  try {
    const response = await fetch('/api/ai/generate-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate job description');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating job description:', error);
    throw error;
  }
}

export async function getSalaryInsights(jobTitle, location, skills) {
  try {
    const response = await fetch('/api/ai/salary-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, location, skills }),
    });

    if (!response.ok) {
      throw new Error('Failed to get salary insights');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting salary insights:', error);
    throw error;
  }
}

export async function evaluateCandidate(resumeText, jobDescription) {
  try {
    const response = await fetch('/api/ai/evaluate-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate candidate');
    }

    return await response.json();
  } catch (error) {
    console.error('Error evaluating candidate:', error);
    throw error;
  }
}
