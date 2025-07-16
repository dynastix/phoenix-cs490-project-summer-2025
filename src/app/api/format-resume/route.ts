// app/api/format-resume/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface FormatRequest {
  resumeContent: string;
  templateId: string;
}

const templatePrompts = {
  'modern-professional': `
Convert the following resume content into a modern professional LaTeX format. Use the provided template structure and fill in the placeholders with appropriate content:

Template placeholders to fill:
- {{NAME}}: Extract the person's name
- {{CONTACT_INFO}}: Format contact information (email, phone, address)
- {{SUMMARY}}: Create a professional summary from the content
- {{EXPERIENCE}}: Format work experience with company, position, dates, and bullet points
- {{EDUCATION}}: Format education with degree, institution, and dates
- {{SKILLS}}: List technical and professional skills

Use clean, professional language and proper LaTeX formatting. Ensure all special characters are properly escaped.

Resume content to format:
`,
  'creative-designer': `
Convert the following resume content into a creative designer LaTeX format. Use artistic language and emphasize creative achievements:

Template placeholders to fill:
- {{NAME}}: Extract the person's name
- {{CONTACT_INFO}}: Format contact information creatively
- {{SUMMARY}}: Create an engaging "About Me" section
- {{EXPERIENCE}}: Format professional experience with emphasis on creative projects
- {{EDUCATION}}: Format education and certifications
- {{SKILLS}}: Organize skills by category (Design Software, Technical Skills, etc.)

Use engaging, creative language while maintaining professionalism. Include creative project descriptions.

Resume content to format:
`,
  'academic-scholar': `
Convert the following resume content into an academic scholar LaTeX format. Use formal academic language and emphasize research and publications:

Template placeholders to fill:
- {{NAME}}: Extract the person's name
- {{CONTACT_INFO}}: Format contact information formally
- {{SUMMARY}}: Create a research interests section
- {{EDUCATION}}: Format education with detailed academic information
- {{EXPERIENCE}}: Format as research experience with methodologies and outcomes
- {{PUBLICATIONS}}: Extract or create publications section
- {{SKILLS}}: Format as technical/research skills
- {{AWARDS}}: Extract awards and honors

Use formal academic language and emphasize research contributions, methodologies, and scholarly achievements.

Resume content to format:
`
};

export async function POST(request: Request) {
  try {
    const { resumeContent, templateId }: FormatRequest = await request.json();

    if (!resumeContent || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = templatePrompts[templateId as keyof typeof templatePrompts];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // First, get the template structure
    const templateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId }),
    });

    const template = await templateResponse.json();
    
    // Use Groq to format the resume content
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional resume formatter. Convert raw resume text into properly formatted LaTeX code using the provided template structure. Replace all template placeholders with actual content from the resume. Ensure proper LaTeX escaping of special characters."
        },
        {
          role: "user",
          content: `${prompt}\n\n${resumeContent}\n\nTemplate to use:\n${template.latexTemplate}`
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const formattedContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      formattedContent,
      templateId,
      success: true
    });

  } catch (error) {
    console.error('Error formatting resume:', error);
    return NextResponse.json(
      { error: 'Failed to format resume' },
      { status: 500 }
    );
  }
}