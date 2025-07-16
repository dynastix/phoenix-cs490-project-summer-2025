import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ResumeFormatter() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "docx">("pdf");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = getAuth().currentUser;

  useEffect(() => {
    async function fetchResumes() {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "userAIResumes");
      const snapshot = await getDocs(ref);
      const resumeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResumes(resumeData);
    }

    fetchResumes();
  }, [user]);

  async function handleFormatAndDownload() {
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    setLoading(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const res = await fetch("/api/format-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          format: selectedFormat,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setDownloadUrl(data.downloadUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Resume Dropdown */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Select Resume</label>
        <select
          value={selectedResumeId}
          onChange={(e) => setSelectedResumeId(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-600 bg-[#1B1917] text-white"
        >
          <option value="">-- Choose Resume --</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.jobTitle} at {resume.companyName}
            </option>
          ))}
        </select>
      </div>

      {/* Format Dropdown */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">Select Format</label>
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as "pdf" | "docx")}
          className="w-full px-3 py-2 rounded border border-gray-600 bg-[#1B1917] text-white"
        >
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
        </select>
      </div>

      {/* Format Button */}
      <button
        onClick={handleFormatAndDownload}
        disabled={loading || !selectedResumeId}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Formatting..." : "Format Resume"}
      </button>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Download Link */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download
          className="text-blue-400 underline block mt-2"
        >
          Click here to download your formatted resume
        </a>
      )}
    </div>
  );
}
