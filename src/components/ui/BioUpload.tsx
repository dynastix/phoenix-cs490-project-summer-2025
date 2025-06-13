"use client";
import { useState } from "react";
import { db } from "../../app/firebaseConfig";;
import { doc, setDoc } from "firebase/firestore";

function BioUpload({ uid }: { uid: string }) {
  const [status, setStatus] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        try {
          await setDoc(doc(db, "users", uid), { documentText: text });
          setStatus("✅ Biography submitted successfully!");
        } catch (error) {
          console.error("Error writing document:", error);
          setStatus("❌ Error submitting biography.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Your Bio</h2>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {status && (
          <p className="mt-4 text-sm font-medium text-green-600">{status}</p>
        )}
      </div>
    </div>
  );
}

export default BioUpload;