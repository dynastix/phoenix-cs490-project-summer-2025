// app/resume-builder/layout.tsx
import React from "react";

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>
      {children}
    </section>
  );
}
