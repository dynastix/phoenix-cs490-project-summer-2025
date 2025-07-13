'use client';

import React, { useState } from 'react';

const CareerBooster = () => {
  const [selectedResume, setSelectedResume] = useState('');
  const [aiAdvice, setAiAdvice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Dummy resume list with mock content
  const resumeOptions = [
    { id: 'resume1', name: 'Software Engineer Resume', content: 'Experience: 5+ years\nSkills: React, Node.js, AWS\nProjects: Portfolio site, E-commerce backend...' },
    { id: 'resume2', name: 'Product Manager Resume', content: 'Experience: 4+ years\nSkills: Agile, Roadmapping, Stakeholder Management\nProjects: Mobile App Launch, SaaS Platform Design...' },
    { id: 'resume3', name: 'Data Analyst Resume', content: 'Experience: 3+ years\nSkills: SQL, Python, Tableau\nProjects: Sales Dashboards, Customer Insights Report...' },
  ];

  const handleGenerateAdvice = () => {
    // Placeholder for AI interaction logic
    console.log(`Generating advice for: ${selectedResume}`);
    setAiAdvice(`Here's some tailored advice based on your selected resume: ${selectedResume}`);
  };

  const currentResume = resumeOptions.find((resume) => resume.id === selectedResume);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Career Booster</h2>

      {/* Resume Selector */}
      <div>
        <label htmlFor="resumeSelect" className="block text-sm font-medium text-gray-300">
          Select a Resume
        </label>
        <select
          id="resumeSelect"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={selectedResume}
          onChange={(e) => {
            setSelectedResume(e.target.value);
            setShowPreview(false); // reset preview on change
          }}
        >
          <option value="">-- Choose a Resume --</option>
          {resumeOptions.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handleGenerateAdvice}
          disabled={!selectedResume}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Get AI Career Advice
        </button>
        <button
          onClick={() => setShowPreview((prev) => !prev)}
          disabled={!selectedResume}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          {showPreview ? 'Hide Preview' : 'Preview Resume'}
        </button>
      </div>

      {/* Resume Preview */}
      {showPreview && currentResume && (
        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Resume Preview</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {currentResume.content}
          </pre>
        </div>
      )}

      {/* AI Advice Output */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Your AI Advice</h3>
        <div className="text-gray-300">
          {aiAdvice ? (
            <p>{aiAdvice}</p>
          ) : (
            <p className="italic text-gray-500">
              AI suggestions will appear here after selecting a resume and clicking the button.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerBooster;
