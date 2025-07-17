import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resumeId, format, userId } = await req.json();

    if (!resumeId || !format || !userId) {
      return NextResponse.json({ success: false, message: "Missing resumeId, format, or userId" }, { status: 400 });
    }

    const downloadUrl = `/api/download-resume?resumeId=${encodeURIComponent(resumeId)}&userId=${encodeURIComponent(userId)}`;

    return NextResponse.json({ success: true, downloadUrl });
  } catch (err: any) {
    console.error("Error preparing download link:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
