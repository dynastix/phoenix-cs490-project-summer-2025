'use client';

import React, { useState } from 'react';
import careerAdvicePrompt from '@/lib/prompts/careerAdvicePrompt';

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

    //   const handleGenerateAdvice = () => {
    //     // Placeholder for AI interaction logic
    //     console.log(`Generating advice for: ${selectedResume}`);
    //     setAiAdvice(`Here's some tailored advice based on your selected resume: ${selectedResume}`);
    //   };

    const handleGenerateAdvice = async () => {
        if (!currentResume) return;

        setAiAdvice('⏳ Generating advice...');
        try {
            const response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentResume.content,
                    prompt: careerAdvicePrompt,
                }),
            });

            if (!response.ok) throw new Error('Groq API request failed');

            const { response: groqText } = await response.json();

            // Try parsing the JSON
            try {
                const parsed = JSON.parse(groqText);
                setAiAdvice(parsed);
            } catch (jsonError) {
                console.warn('⚠️ JSON parsing failed:', jsonError);
                setAiAdvice('⚠️ Invalid JSON format received from AI.');
            }
        } catch (error) {
            console.error('Error generating advice:', error);
            setAiAdvice('❌ Failed to generate advice.');
        }
    };


    const currentResume = resumeOptions.find((resume) => resume.id === selectedResume);
    //   const response = await callGroqAPI(resumeText, careerAdvicePrompt);

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
                <div className="text-gray-300 space-y-4">
                    {typeof aiAdvice === 'string' ? (
                        <p className="italic text-sm text-gray-500">⏳ Generating advice...</p>
                    ) : aiAdvice ? (
                        <>
                            {/* Resume Wording Advice */}
                            <div>
                                <h4 className="text-lg font-semibold text-white">Resume Wording Advice</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                                    {aiAdvice.resumeWordingAdvice.map((tip: string, index: number) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Experience Enhancement Suggestions */}
                            <div>
                                <h4 className="text-lg font-semibold text-white">Experience Enhancement Suggestions</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                                    {aiAdvice.experienceEnhancementSuggestions.map((tip: string, index: number) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Next Steps */}
                            <div>
                                <h4 className="text-lg font-semibold text-white">Next Steps to Improve Career Prospects</h4>

                                {/* Certifications or Courses */}
                                <div className="mt-2">
                                    <h5 className="text-md font-medium text-gray-100">Certifications or Courses</h5>
                                    <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                                        {aiAdvice.nextStepsToImproveCareerProspects.certificationsOrCourses.map((item: string, idx: number) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Job Titles to Pursue */}
                                <div className="mt-2">
                                    <h5 className="text-md font-medium text-gray-100">Job Titles to Pursue</h5>
                                    <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                                        {aiAdvice.nextStepsToImproveCareerProspects.jobTitlesToPursue.map((item: string, idx: number) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* General Career Advice */}
                                <div className="mt-2">
                                    <h5 className="text-md font-medium text-gray-100">General Career Advice</h5>
                                    <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
                                        {aiAdvice.nextStepsToImproveCareerProspects.generalCareerAdvice.map((item: string, idx: number) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
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

