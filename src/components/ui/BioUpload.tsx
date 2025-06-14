"use client";
import { useState } from "react";
import { db } from "../../app/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function BioUpload({ uid }: { uid: string }) {
  const [bioText, setBioText] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setBioText(text);
        setStatus(""); // Clear old status
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!bioText) {
      setStatus("Please upload a file first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "users", uid), {
        documentText: bioText,
      });
      setStatus("✅ Biography submitted successfully!");
    } catch (error) {
      console.error("Error writing document:", error);
      setStatus(" Error submitting biography.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Your Bio</h2>
        
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />

        {bioText && (
          <div className="mb-4 text-left p-3 bg-gray-50 border rounded text-sm max-h-40 overflow-auto">
            <pre>{bioText}</pre>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          {isSubmitting ? "Submitting..." : "Submit to Database"}
        </button>

        {status && <p className="mt-4 text-sm font-medium text-green-600">{status}</p>}
      </div>
    </div>
  );
}

export default BioUpload;