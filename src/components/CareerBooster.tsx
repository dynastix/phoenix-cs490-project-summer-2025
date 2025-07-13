'use client';

import React, { useState } from 'react';

const CareerBooster = () => {
  const [selectedResume, setSelectedResume] = useState('');
  const [aiAdvice, setAiAdvice] = useState(null);

  // Dummy resume list (to be replaced with real data from props or API)
  const resumeOptions = [
    { id: 'resume1', name: 'Software Engineer Resume' },
    { id: 'resume2', name: 'Product Manager Resume' },
    { id: 'resume3', name: 'Data Analyst Resume' },
  ];

  const handleGenerateAdvice = () => {
    // Placeholder for AI interaction logic
    console.log(`Generating advice for: ${selectedResume}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Career Booster</h2>

      {/* Resume Selector */}
      <div>
        <label htmlFor="resumeSelect" className="block text-sm font-medium text-gray-700">
          Select a Resume
        </label>
        <select
          id="resumeSelect"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={selectedResume}
          onChange={(e) => setSelectedResume(e.target.value)}
        >
          <option value="">-- Choose a Resume --</option>
          {resumeOptions.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.name}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Advice Button */}
      <div>
        <button
          onClick={handleGenerateAdvice}
          disabled={!selectedResume}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Get AI Career Advice
        </button>
      </div>

      {/* AI Advice Output */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Your AI Advice</h3>
        <div className="text-gray-700">
          {aiAdvice ? (
            <p>{aiAdvice}</p>
          ) : (
            <p className="italic text-gray-500">AI suggestions will appear here after selecting a resume and clicking the button.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerBooster;
