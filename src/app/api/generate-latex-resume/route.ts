// app/api/generate-latex-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const templatePrompts = {
  professional: `
You are a LaTeX expert. Convert the following resume content into a clean, professional LaTeX document. Use these guidelines:

1. Use the article document class
2. Include necessary packages: geometry, enumitem, titlesec, xcolor, fontspec (if available)
3. Set professional margins and spacing
4. Use clear section headers for: Contact Info, Summary/Objective, Experience, Education, Skills
5. Format work experience with company, position, dates, and bullet points
6. Use consistent formatting throughout
7. Ensure the output is valid LaTeX that can be compiled
8. Use professional fonts and spacing
9. Include contact information at the top
10. Make it clean and readable

Resume content:
`,
  creative: `
You are a LaTeX expert. Convert the following resume content into a creative, modern LaTeX document. Use these guidelines:

1. Use the article document class
2. Include packages for creative elements: geometry, enumitem, titlesec, xcolor, fontspec, tikz
3. Use creative but professional colors (blues, grays)
4. Add subtle design elements like colored section headers
5. Use modern typography and spacing
6. Include sections: Contact, Profile, Experience, Education, Skills
7. Make experience entries visually appealing with good use of white space
8. Ensure the output is valid LaTeX that can be compiled
9. Balance creativity with professionalism
10. Use visual hierarchy effectively

Resume content:
`,
  academic: `
You are a LaTeX expert. Convert the following resume content into an academic CV format in LaTeX. Use these guidelines:

1. Use the article document class
2. Include standard academic packages: geometry, enumitem, titlesec
3. Use traditional academic formatting
4. Include comprehensive sections: Contact, Education, Research Experience, Publications, Conferences, Awards, Skills
5. Format education with institution, degree, dates, GPA if provided
6. List research experience in detail
7. Include publication formatting if any research is mentioned
8. Use formal, academic language
9. Ensure the output is valid LaTeX that can be compiled
10. Follow academic CV conventions

Resume content:
`
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeContent, template, uid } = body;

    if (!resumeContent || !template || !uid) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const selectedPrompt = templatePrompts[template as keyof typeof templatePrompts];
    if (!selectedPrompt) {
      return NextResponse.json({ message: 'Invalid template' }, { status: 400 });
    }

    const fullPrompt = `${selectedPrompt}

${resumeContent}

Please provide ONLY the LaTeX code, no explanations or additional text. Start with \\documentclass and end with \\end{document}. Make sure all sections are properly formatted and the document will compile successfully.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 4000,
    });

    const latexContent = chatCompletion.choices[0]?.message?.content;

    if (!latexContent) {
      return NextResponse.json({ message: 'Failed to generate LaTeX content' }, { status: 500 });
    }

    // Clean up the LaTeX content - remove any markdown formatting if present
    const cleanLatexContent = latexContent
      .replace(/```latex\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return NextResponse.json({
      latexContent: cleanLatexContent,
      template,
      uid,
    });
  } catch (error) {
    console.error('Error generating LaTeX resume:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}