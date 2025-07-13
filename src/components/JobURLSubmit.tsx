// components/JobURLSubmit.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export default function JobURLSubmit() {
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!jobUrl.trim()) {
      setStatus("Please enter a job URL.");
      return;
    }

    if (!user?.uid) {
      setStatus("You must be signed in.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Fetching and analyzing job description...");

    try {
      const response = await fetch("/api/groq-jobURLExtract", {


        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobUrl }),
      });

      if (!response.ok) throw new Error("URL analysis failed");

      const extractedData = await response.json();

      const userJobDescriptionsRef = collection(
        firestore,
        "users",
        user.uid,
        "userJobDescriptions"
      );

      await addDoc(userJobDescriptionsRef, {
        originalURL: jobUrl,
        jobTitle: extractedData.jobTitle,
        companyName: extractedData.companyName,
        jobDescription: extractedData.jobDescription,
        extractedAt: extractedData.timestamp,
        createdAt: new Date(),
        appliedTo: false,
        applicationTime: null,
        applicationResumeId: null,
      });

      setStatus("Job data extracted and saved successfully.");
      setJobUrl("");
    } catch (err) {
      console.error("Error:", err);
      setStatus("Error processing job URL. Please try another.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-0 pb-4">
      <div className="flex flex-col gap-3 w-full">
        <input
          type="text"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          placeholder="Paste job listing URL here..."
          className="w-full p-3 rounded-md bg-zinc-900 text-white border border-zinc-700"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Extract From URL & Save Job Details"}
        </button>
        {status && (
          <p className={`text-sm ${status.includes("Error") ? "text-red-500" : "text-green-500"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
