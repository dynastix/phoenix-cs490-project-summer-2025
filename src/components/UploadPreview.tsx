"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/authContext";
import UploadedItemList from "@/components/UploadedItemList";
import FloatingPanel from "@/components/FloatingPanel";

interface UploadedItem {
  id: string;
  name: string;
  createdAt: Date;
  type: string;
  content?: string;
}

export default function UploadPreview() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<UploadedItem[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUploads = async () => {
      const q = query(
        collection(db, "uploads"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        const type = data.type || "file";
        const content = data.content || data.text || "";

        const name =
          type === "text"
            ? content.trim().split(/\s+/).slice(0, 3).join(" ") || "Freeform Text"
            : data.name;

        return {
          id: doc.id,
          name,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          type,
          content,
        };
      });

      setAllItems(items);
      setLoading(false);
    };

    fetchUploads();
  }, [user]);

  if (loading) return <p>Loading upload preview...</p>;

  const previewItems = allItems.slice(0, 3);
  const hasMore = allItems.length > 0;

  return (
    <div className="w-full">
      <div className="border p-3 rounded-lg shadow mb-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-2">Recent Uploads</h2>

        {previewItems.length === 0 ? (
          <p>No uploads yet.</p>
        ) : (
          <ul className="space-y-2">
            {previewItems.map(item => (
              <li key={item.id} className="border-b pb-2">
                <strong>{item.name}</strong>{" "}
                <span className="text-xs text-blue-600">
                  [{item.type === "text" ? "freeform" : item.type}]
                </span>
                <br />
                <span className="text-sm text-gray-600">
                  Uploaded on {item.createdAt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setShowPanel(true)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          View All
        </button>
      </div>

      {showPanel && (
        <FloatingPanel title="All Uploaded Files" onClose={() => setShowPanel(false)}>
          <UploadedItemList />
        </FloatingPanel>
      )}
    </div>
  );
}
