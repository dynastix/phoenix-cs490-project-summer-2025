// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const tempDir = path.join(process.cwd(), 'tmp');
  const timestamp = Date.now();
  const filename = `resume_${timestamp}`;
  const texFilePath = path.join(tempDir, `${filename}.tex`);
  const pdfFilePath = path.join(tempDir, `${filename}.pdf`);

  try {
    const body = await req.json();
    const { latexContent, filename: requestedFilename } = body;

    if (!latexContent) {
      return NextResponse.json({ message: 'LaTeX content is required' }, { status: 400 });
    }

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Write LaTeX content to file
    await fs.writeFile(texFilePath, latexContent, 'utf8');

    // Compile LaTeX to PDF using pdflatex
    try {
      await execAsync(`cd ${tempDir} && pdflatex -interaction=nonstopmode ${filename}.tex`);
      
      // Run pdflatex twice to ensure references are resolved
      await execAsync(`cd ${tempDir} && pdflatex -interaction=nonstopmode ${filename}.tex`);
    } catch (latexError) {
      console.error('LaTeX compilation error:', latexError);
      
      // Try to read the log file for more details
      try {
        const logContent = await fs.readFile(path.join(tempDir, `${filename}.log`), 'utf8');
        console.error('LaTeX log:', logContent);
      } catch (logReadError) {
        console.error('Could not read LaTeX log:', logReadError);
      }
      
      return NextResponse.json({ 
        message: 'PDF compilation failed', 
        error: 'LaTeX compilation error'
      }, { status: 500 });
    }

    // Check if PDF was generated
    try {
      await fs.access(pdfFilePath);
    } catch {
      return NextResponse.json({ message: 'PDF file was not generated' }, { status: 500 });
    }

    // Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfFilePath);

    // Clean up temporary files
    try {
      await fs.unlink(texFilePath);
      await fs.unlink(pdfFilePath);
      // Also clean up auxiliary files
      const auxFiles = [
        `${filename}.aux`,
        `${filename}.log`,
        `${filename}.out`,
        `${filename}.toc`,
        `${filename}.fls`,
        `${filename}.fdb_latexmk`
      ];
      
      for (const auxFile of auxFiles) {
        try {
          await fs.unlink(path.join(tempDir, auxFile));
        } catch {
          // Ignore errors for auxiliary files
        }
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Create response with PDF buffer
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${requestedFilename || 'resume.pdf'}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Clean up on error
    try {
      await fs.unlink(texFilePath);
      await fs.unlink(pdfFilePath);
    } catch {
      // Ignore cleanup errors
    }
    
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}