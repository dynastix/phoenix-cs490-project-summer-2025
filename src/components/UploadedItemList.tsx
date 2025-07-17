// // "use client";

// // import { useEffect, useState } from "react";
// // import { collection, getDocs } from "firebase/firestore";
// // import { db } from "@/lib/firebase";

// // interface UploadedItem {
// //   id: string;
// //   name: string;
// //   userId: string;
// //   createdAt: Date;
// //   type: string;
// //   content?: string;
// // }

// // export default function UploadedItemList() {
// //   const [items, setItems] = useState<UploadedItem[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchAllUploads = async () => {
// //       const snapshot = await getDocs(collection(db, "uploads"));

// //       const fetchedItems = snapshot.docs.map(doc => {
// //         const data = doc.data();
// //         const type = data.type || "file";
// //         const content = data.content || "";
// //         const name =
// //           type === "text"
// //             ? content.trim().split(/\s+/).slice(0, 3).join(" ") || "Freeform Text"
// //             : data.name;

// //         return {
// //           id: doc.id,
// //           name,
// //           userId: data.userId,
// //           createdAt: data.createdAt?.toDate?.() || new Date(),
// //           type,
// //           content,
// //         };
// //       });

// //       fetchedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

// //       setItems(fetchedItems);
// //       setLoading(false);
// //     };

// //     fetchAllUploads();
// //   }, []);

// //   if (loading) return <div>Loading uploaded items...</div>;

// //   return (
// //     <div className="mt-4">
// //       {items.length === 0 ? (
// //         <p>No items have been uploaded yet.</p>
// //       ) : (
// //         <ul className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded-lg shadow">
// //           {items.map(item => (
// //             <li key={item.id} className="p-2 border-b">
// //               <strong>{item.name}</strong>{" "}
// //               <span className="text-xs text-blue-600">
// //                 [{item.type === "text" ? "freeform" : item.type}]
// //               </span>
// //               <br />
// //               <span className="text-sm text-gray-500">
// //                 Uploaded by: {item.userId}
// //                 <br />
// //                 On: {item.createdAt.toLocaleString()}
// //               </span>
// //             </li>
// //           ))}
// //         </ul>
// //       )}
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Modal from "../components/ui/modal";

// interface UploadedItem {
//   id: string;
//   name: string;
//   userId: string;
//   createdAt: Date;
//   type: string;
//   content?: string;
//   text?: string;

// }

// export default function UploadedItemList() {
//   const [items, setItems] = useState<UploadedItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeItem, setActiveItem] = useState<UploadedItem | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     const fetchAllUploads = async () => {
//       const snapshot = await getDocs(collection(db, "uploads"));
//       const fetchedItems = snapshot.docs.map(doc => {
//         const data = doc.data();
//         const type = data.type || "file";
//         const content = data.content || data.text || ""; // ← this line fixed
//         const name =
//           type === "text"
//             ? content.trim().split(/\s+/).slice(0, 3).join(" ") || "Freeform Text"
//             : data.name;

//         return {
//           id: doc.id,
//           name,
//           userId: data.userId,
//           createdAt: data.createdAt?.toDate?.() || new Date(),
//           type,
//           content,
//           text: data.text || "",
//         };
//       });



//       fetchedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//       setItems(fetchedItems);
//       setLoading(false);
//     };

//     fetchAllUploads();
//   }, []);

//   const handleItemClick = (item: UploadedItem) => {
//     setActiveItem(item);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="mt-4 w-full max-w-6xl mx-auto">
//       {loading ? (
//         <p>Loading uploaded items...</p>
//       ) : items.length === 0 ? (
//         <p>No items have been uploaded yet.</p>
//       ) : (
//         <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
//           {items.map(item => (
//             <li
//               key={item.id}
//               className="border rounded p-4 shadow hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-900"
//               onClick={() => handleItemClick(item)}
//             >
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
//                   {item.type === "text" ? "📝" : "📄"}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-blue-700 hover:underline">
//                     {item.name}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     [{item.type === "text" ? "freeform" : item.type}]
//                   </p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500">
//                 Uploaded: {item.createdAt.toLocaleString()}
//               </p>
//             </li>
//           ))}
//         </ul>
//       )}

//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title={activeItem?.name}
//       >
//         {activeItem?.content || activeItem?.text ? (
//           <pre className="whitespace-pre-wrap text-sm max-h-[50vh] overflow-y-auto bg-gray-100 p-3 rounded">
//             {activeItem?.content || activeItem?.text}
//           </pre>
//         ) : (
//           <p className="text-gray-500 italic">No content available.</p>
//         )}
//       </Modal>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { collection, getDocs, doc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Modal from "../components/ui/modal";

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
  const [activeItem, setActiveItem] = useState<UploadedItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllUploads = async () => {
      const snapshot = await getDocs(collection(db, "uploads"));
      const fetchedItems = snapshot.docs.map(doc => {
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

  const handleItemClick = (item: UploadedItem) => {
    setActiveItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-4 w-full max-w-6xl mx-auto">
      {loading ? (
        <p>Loading uploaded items...</p>
      ) : items.length === 0 ? (
        <p>No items have been uploaded yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map(item => (
            <li
              key={item.id}
              className="border rounded p-4 shadow hover:shadow-lg transition cursor-pointer bg-white dark:bg-gray-900"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  {item.type === "text" ? "📝" : "📄"}
                </div>
                <div>
                  <p className="font-semibold text-blue-700 hover:underline">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    [{item.type === "text" ? "freeform" : item.type}]
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Uploaded: {item.createdAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeItem?.name}
      >
        {activeItem?.content ? (
          <pre className="whitespace-pre-wrap text-sm max-h-[50vh] overflow-y-auto bg-gray-100 p-3 rounded">
            {activeItem.content}
          </pre>
        ) : (
          <p className="text-gray-500 italic">No content available.</p>
        )}
      </Modal>
    </div>
  );
}

