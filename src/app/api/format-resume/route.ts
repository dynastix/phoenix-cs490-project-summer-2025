import { NextRequest, NextResponse } from 'next/server';

// Temporary mock for formatting logic
export async function POST(req: NextRequest) {
  try {
    const { resumeId, format } = await req.json();

    if (!resumeId || !format) {
      return NextResponse.json({ success: false, message: 'Missing resumeId or format' }, { status: 400 });
    }

    // Replace this with real Firestore resume content fetch
    const dummyContent = `This is a mock resume for ID: ${resumeId}`;

    // Replace this with real formatting logic using file type
    const fileBuffer = Buffer.from(dummyContent, 'utf-8');
    const fileName = `resume-${resumeId}.${format}`;

    // Return a mock download URL
    const downloadUrl = `/api/format-resume/mock-download?file=${encodeURIComponent(fileName)}`;

    // Later, I'll write logic to persist and serve actual files here
    return NextResponse.json({ success: true, downloadUrl });
  } catch (error) {
    console.error('Formatting failed:', error);
    return NextResponse.json({ success: false, message: 'Server error during formatting' }, { status: 500 });
  }
}



{/*

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { resumeId, format } = await req.json();

    if (!resumeId || !format) {
      return NextResponse.json({ success: false, message: "Missing resumeId or format" }, { status: 400 });
    }

    // For now, we’ll just fake the file output
    // In the future, I'd retrieve and format real resume content here
    const userId = "mockUser"; // Replace this later with actual auth

    const resumeRef = doc(db, "users", userId, "userAIResumes", resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) {
      return NextResponse.json({ success: false, message: "Resume not found" }, { status: 404 });
    }

    const resumeData = resumeSnap.data();
    const filename = `resume-${resumeId}.${format}`;

    // For now, return a mocked static download URL (you'll implement this later)
    const downloadUrl = `/mock-resume-downloads/${filename}`;

    return NextResponse.json({ success: true, downloadUrl });
  } catch (err: any) {
    console.error("Error formatting resume:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
   
*/}