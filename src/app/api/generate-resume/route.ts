import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

export async function POST(request: NextRequest) {
  try {
    const { jobData, userData, userId }: {
      jobData: JobDescription;
      userData: any;
      userId: string;
    } = await request.json();

    if (!jobData || !userData || !userId) {
      return NextResponse.json(
        { error: 'Missing required data: jobData, userData, or userId' },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional resume tailored to the job requirements. Output ONLY the resume content without any introductory text, explanations, or comments.

JOB REQUIREMENTS:
Title: ${jobData.jobTitle}
Company: ${jobData.companyName}
Description: ${jobData.jobDescription}

USER DATA:
${JSON.stringify(userData, null, 2)}

RESUME FORMAT REQUIREMENTS:
- Start directly with the contact information
- Include: Contact Info, Professional Summary, Experience, Skills, Education
- Use bullet points for experience items
- Tailor content to match job keywords and requirements
- Quantify achievements where possible
- Keep content ATS-friendly
- Maximum 2 pages worth of content

- Tailor the resume to fit the JOB REQUIREMENTS as best as possible

OUTPUT ONLY THE RESUME CONTENT - NO ADDITIONAL TEXT OR COMMENTS.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Output only the requested resume content without any explanatory text, introductions, or commentary. Start directly with the resume content.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 1500,
    });

    let generatedResume = completion.choices[0]?.message?.content;

    if (!generatedResume) {
      return NextResponse.json(
        { error: 'No resume generated from Groq' },
        { status: 500 }
      );
    }

    generatedResume = cleanResumeContent(generatedResume);

    const resumeData = {
      resumeContent: generatedResume,
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
      jobId: jobData.id,
      jobDesc: jobData.jobDescription,
      generatedAt: new Date().toISOString(),
      userId: userId,
      metadata: {
        model: 'llama3-70b-8192',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }
    };

    // ✅ Save resume to Firestore
    const docRef = await addDoc(
      collection(db, 'users', userId, 'userAIResumes'),
      resumeData
    );

    // ✅ Attach Firestore ID to response
    resumeData['resumeId'] = docRef.id;

    return NextResponse.json({
      success: true,
      data: resumeData,
      message: 'Resume generated and saved successfully',
    });

  } catch (error) {
    console.error('Resume Generation Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate resume',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function cleanResumeContent(content: string): string {
  const unwantedPatterns = [
    /^Here is a tailored resume.*?:/i,
    /^Here's a professional resume.*?:/i,
    /^I've created a resume.*?:/i,
    /^Below is a tailored resume.*?:/i,
    /^This resume is tailored.*?:/i,
    /^Here's the resume.*?:/i,
    /^I'll create a resume.*?:/i,
    /^Let me create.*?:/i,
    /^I've tailored this resume.*?:/i,
    /^This professional resume.*?:/i,
  ];

  let cleanedContent = content.trim();

  for (const pattern of unwantedPatterns) {
    cleanedContent = cleanedContent.replace(pattern, '').trim();
  }

  cleanedContent = cleanedContent.replace(/^\s+|\s+$/g, '');
  return cleanedContent;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
