"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface JobDescription {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  extractedAt: string;
  createdAt: any;
}

interface Props {
  selectedJob?: JobDescription | null;
  onSelect: (job: JobDescription | null) => void;
}

export default function UserJobDescriptionList({ selectedJob, onSelect }: Props) {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobDescriptions = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const userJobDescriptionsRef = collection(
        db,
        "users",
        user.uid,
        "userJobDescriptions"
      );
      const q = query(userJobDescriptionsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const jobs: JobDescription[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          jobTitle: data.jobTitle || "Untitled",
          companyName: data.companyName || "Unknown",
          jobDescription: data.jobDescription || "",
          extractedAt: data.extractedAt || "",
          createdAt: data.createdAt,
        };
      });

      setJobDescriptions(jobs);
    } catch (err) {
      console.error("Error loading jobs", err);
      setError("Failed to load job descriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const job = jobDescriptions.find(j => j.id === jobId);
    if (!confirm(`Delete "${job?.jobTitle}" at ${job?.companyName}?`)) return;

    try {
      setDeletingId(jobId);
      await deleteDoc(doc(db, "users", user.uid, "userJobDescriptions", jobId));
      setJobDescriptions(prev => prev.filter(j => j.id !== jobId));
      if (selectedJob?.id === jobId) onSelect(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  useEffect(() => {
    fetchJobDescriptions();
  }, []);

  if (loading) return <p className="text-gray-400">Loading job descriptions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (jobDescriptions.length === 0)
    return <p className="text-gray-500">No job descriptions uploaded yet.</p>;

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {jobDescriptions.map((job) => (
        <div
          key={job.id}
          onClick={() => onSelect(job)}
          className={`cursor-pointer border rounded p-3 transition-all
            ${selectedJob?.id === job.id
              ? "border-orange-600 bg-zinc-800"
              : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
            }`}
        >
          <div className="flex justify-between items-start space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{job.jobTitle}</p>
              <p className="text-orange-400 truncate">{job.companyName}</p>
              <p className="text-xs text-zinc-500">{formatDate(job.extractedAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
