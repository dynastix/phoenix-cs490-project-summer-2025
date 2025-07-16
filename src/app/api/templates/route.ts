// app/api/templates/route.ts
import { NextResponse } from 'next/server';

interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  latexTemplate: string;
}

const templates: Template[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, modern design with bold headers and elegant typography. Perfect for corporate and professional roles.',
    imageUrl: '/templates/modern-professional.jpg',
    latexTemplate: `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\geometry{top=1in, bottom=1in, left=1in, right=1in}
\\definecolor{primarycolor}{RGB}{41, 128, 185}
\\definecolor{secondarycolor}{RGB}{52, 73, 94}

\\titleformat{\\section}{\\Large\\bfseries\\color{primarycolor}}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}{\\large\\bfseries\\color{secondarycolor}}{}{0em}{}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

\\begin{document}

% Header
\\begin{center}
{\\Huge\\bfseries\\color{primarycolor} {{NAME}}}\\\\[0.5em]
{\\large {{CONTACT_INFO}}}
\\end{center}

\\vspace{1em}

% Professional Summary
\\section{Professional Summary}
{{SUMMARY}}

% Experience
\\section{Experience}
{{EXPERIENCE}}

% Education
\\section{Education}
{{EDUCATION}}

% Skills
\\section{Skills}
{{SKILLS}}

\\end{document}
    `
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Vibrant and creative layout with artistic elements. Ideal for designers, artists, and creative professionals.',
    imageUrl: '/templates/creative-designer.jpg',
    latexTemplate: `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{tikz}
\\usepackage{hyperref}

\\geometry{top=0.8in, bottom=0.8in, left=1in, right=1in}
\\definecolor{accent}{RGB}{231, 76, 60}
\\definecolor{darkgray}{RGB}{44, 62, 80}
\\definecolor{lightgray}{RGB}{149, 165, 166}

\\titleformat{\\section}{\\Large\\bfseries\\color{accent}}{}{0em}{}[\\color{lightgray}\\titlerule[2pt]]
\\titleformat{\\subsection}{\\large\\bfseries\\color{darkgray}}{}{0em}{}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{8pt}

\\begin{document}

% Creative Header
\\begin{center}
\\begin{tikzpicture}
\\node[rectangle, fill=accent, text=white, minimum width=10cm, minimum height=1.5cm] at (0,0) {\\Huge\\bfseries {{NAME}}};
\\end{tikzpicture}\\\\[0.5em]
{\\large\\color{darkgray} {{CONTACT_INFO}}}
\\end{center}

\\vspace{1em}

% About Me
\\section{About Me}
{{SUMMARY}}

% Professional Experience
\\section{Professional Experience}
{{EXPERIENCE}}

% Education & Certifications
\\section{Education \\& Certifications}
{{EDUCATION}}

% Skills & Expertise
\\section{Skills \\& Expertise}
{{SKILLS}}

\\end{document}
    `
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    description: 'Traditional academic format with emphasis on publications and research. Perfect for academic and research positions.',
    imageUrl: '/templates/academic-scholar.jpg',
    latexTemplate: `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\geometry{top=1in, bottom=1in, left=1.2in, right=1.2in}
\\definecolor{academicblue}{RGB}{25, 25, 112}
\\definecolor{textgray}{RGB}{64, 64, 64}

\\titleformat{\\section}{\\Large\\bfseries\\color{academicblue}}{}{0em}{}[\\vspace{-0.5em}\\color{academicblue}\\hrule height 1pt]
\\titleformat{\\subsection}{\\large\\bfseries\\color{textgray}}{}{0em}{}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

\\begin{document}

% Academic Header
\\begin{center}
{\\LARGE\\bfseries\\color{academicblue} {{NAME}}}\\\\[0.3em]
{\\normalsize {{CONTACT_INFO}}}
\\end{center}

\\vspace{0.5em}

% Research Interests
\\section{Research Interests}
{{SUMMARY}}

% Education
\\section{Education}
{{EDUCATION}}

% Research Experience
\\section{Research Experience}
{{EXPERIENCE}}

% Publications
\\section{Publications}
{{PUBLICATIONS}}

% Skills
\\section{Technical Skills}
{{SKILLS}}

% Awards & Honors
\\section{Awards \\& Honors}
{{AWARDS}}

\\end{document}
    `
  }
];

export async function GET() {
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const { templateId } = await request.json();
  
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  
  return NextResponse.json(template);
}