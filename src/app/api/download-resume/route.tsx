import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Escape LaTeX special characters
function escapeLaTeX(str: string): string {
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!resumeId || !userId) {
      return new Response('Missing resumeId or userId', { status: 400 });
    }

    // Retrieve resume content from Firestore
    const resumeRef = doc(db, 'users', userId, 'userAIResumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    if (!resumeSnap.exists()) {
      return new Response('Resume not found', { status: 404 });
    }

    const { resumeContent } = resumeSnap.data();
    if (!resumeContent || typeof resumeContent !== 'string') {
      return new Response('Invalid resume content', { status: 500 });
    }

const tex = `
\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\geometry{margin=1in}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}
\\renewcommand{\\familydefault}{\\sfdefault}

\\begin{document}

% Resume Body
\\vspace{8pt}

${escapeLaTeX(resumeContent)}

\\end{document}
`;


    // Save .tex file to tmp folder
    const tmpFileName = `${uuidv4()}.tex`;
    const tmpFilePath = join(tmpdir(), tmpFileName);
    const outputDir = tmpdir();
    await fs.writeFile(tmpFilePath, tex);

    // Run tectonic to compile .tex -> .pdf
    const command = `tectonic -o ${outputDir} ${tmpFilePath}`;
    await execAsync(command);

    const pdfPath = tmpFilePath.replace(/\.tex$/, '.pdf');
    const pdfBuffer = await fs.readFile(pdfPath);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${resumeId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('PDF route crashed:', err);
    return new Response('Server error', { status: 500 });
  }
}
