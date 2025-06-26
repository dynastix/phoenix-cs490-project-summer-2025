"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ✅ Make sure this path is correct

export default function BioUpload() {
  const [bioText, setBioText] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();



const handleSubmit = async () => {
  if (!bioText.trim()) {
    setStatus("Please enter your biography.");
    return;
  }

  if (!user?.uid) {
    setStatus("You must be signed in.");
    return;
  }

  setIsSubmitting(true);
  try {
    await addDoc(collection(db, "uploads"), {
      userId: user.uid,
      name: "Freeform Text",
      type: "text",
      content: bioText,
      createdAt: serverTimestamp(),
    });

    setStatus("Biography uploaded!");
    setBioText(""); // clear textarea
  } catch (err) {
    console.error(err);
    setStatus("Error submitting.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={bioText}
        onChange={(e) => setBioText(e.target.value)}
        placeholder="Write your biography here..."
        className="w-full p-2 border rounded text-sm h-40 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      {status && <p className="text-sm text-green-600">{status}</p>}
    </div>
  );
}
