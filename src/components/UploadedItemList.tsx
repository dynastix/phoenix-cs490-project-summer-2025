"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UploadedItem {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  type: string;
  content?: string;
}

export default function UploadedItemList() {
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUploads = async () => {
      const snapshot = await getDocs(collection(db, "uploads"));

      const fetchedItems = snapshot.docs.map(doc => {
        const data = doc.data();
        const type = data.type || "file";
        const content = data.content || "";
        const name =
          type === "text"
            ? content.trim().split(/\s+/).slice(0, 3).join(" ") || "Freeform Text"
            : data.name;

        return {
          id: doc.id,
          name,
          userId: data.userId,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          type,
          content,
        };
      });

      fetchedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setItems(fetchedItems);
      setLoading(false);
    };

    fetchAllUploads();
  }, []);

  if (loading) return <div>Loading uploaded items...</div>;

  return (
    <div className="mt-4">
      {items.length === 0 ? (
        <p>No items have been uploaded yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded-lg shadow">
          {items.map(item => (
            <li key={item.id} className="p-2 border-b">
              <strong>{item.name}</strong>{" "}
              <span className="text-xs text-blue-600">
                [{item.type === "text" ? "freeform" : item.type}]
              </span>
              <br />
              <span className="text-sm text-gray-500">
                Uploaded by: {item.userId}
                <br />
                On: {item.createdAt.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
