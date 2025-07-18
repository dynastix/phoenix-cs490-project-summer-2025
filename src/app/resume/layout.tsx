"use client";

import { ReactNode, useState } from "react";
import TopBanner from "@/components/topBanner"; // Import the TopBanner component
import SidePanel from "@/components/sidePanel"; // Import the SidePanel component



export default function HomeLayout({ children }: { children: ReactNode }) {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Default to true

    

    const toggleSidePanel = () => {
        setIsSidePanelOpen((prev) => !prev);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Banner */}
            <TopBanner toggleSidePanel={toggleSidePanel} />

            {/* Main Layout */}
            <div className="flex flex-1">
                {/* Conditionally render SidePanel with the prop */}
                {isSidePanelOpen && <SidePanel isSidePanelOpen={isSidePanelOpen} />}

                {/* Main Content */}
                <main className="flex-1 max-w p-1">
                    {children}


                 

                </main>
            </div>
        </div>
    );
}