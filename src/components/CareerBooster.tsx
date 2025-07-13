'use client';

import React, { useState } from 'react';
import careerAdvicePrompt from '@/lib/prompts/careerAdvicePrompt';
import {
    LightBulbIcon,
    ChartBarIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';



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

        setAiAdvice({ status: 'loading' });
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
                setAiAdvice({ status: 'error', message: 'Invalid JSON format received from AI.' });

            }
        } catch (error) {
            console.error('Error generating advice:', error);
            setAiAdvice({ status: 'error', message: 'Failed to generate advice.' });
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
                <div className="mt-10 space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                        Your AI-Powered Career Advice
                    </h3>

                    {aiAdvice?.status === 'loading' ? (
                        <div className="flex items-center space-x-2 text-gray-300">
                            <svg
                                className="animate-spin h-5 w-5 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                            <span>Generating advice...</span>
                        </div>
                    ) : aiAdvice?.status === 'error' ? (
                        <p className="text-red-500">{aiAdvice.message}</p>
                    ) : aiAdvice && typeof aiAdvice === 'object' ? (
                        <>
                            {/* Resume Wording Advice */}
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <LightBulbIcon className="h-5 w-5 text-yellow-400" />
                                    <h4 className="text-lg font-semibold text-white">Resume Wording Advice</h4>
                                </div>
                                <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                                    {aiAdvice.resumeWordingAdvice?.map((tip: string, index: number) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Experience Enhancement Suggestions */}
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <ChartBarIcon className="h-5 w-5 text-green-400" />
                                    <h4 className="text-lg font-semibold text-white">Experience Suggestions</h4>
                                </div>
                                <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                                    {aiAdvice.experienceEnhancementSuggestions?.map((tip: string, index: number) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center space-x-2 mb-4">
                                    <BriefcaseIcon className="h-5 w-5 text-blue-400" />
                                    <h4 className="text-lg font-semibold text-white">Next Steps to Improve Career Prospects</h4>
                                </div>

                                {/* Certifications or Courses */}
                                <div className="mb-3">
                                    <div className="flex items-center space-x-1 mb-1">
                                        <AcademicCapIcon className="h-4 w-4 text-indigo-300" />
                                        <h5 className="text-sm font-medium text-gray-100">Certifications or Courses</h5>
                                    </div>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                                        {aiAdvice.nextStepsToImproveCareerProspects?.certificationsOrCourses?.map(
                                            (item: string, idx: number) => (
                                                <li key={idx}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {/* Job Titles to Pursue */}
                                <div className="mb-3">
                                    <div className="flex items-center space-x-1 mb-1">
                                        <BriefcaseIcon className="h-4 w-4 text-indigo-300" />
                                        <h5 className="text-sm font-medium text-gray-100">Job Titles to Pursue</h5>
                                    </div>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                                        {aiAdvice.nextStepsToImproveCareerProspects?.jobTitlesToPursue?.map(
                                            (item: string, idx: number) => (
                                                <li key={idx}>{item}</li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {/* General Career Advice */}
                                <div>
                                    <div className="flex items-center space-x-1 mb-1">
                                        <ChatBubbleLeftIcon className="h-4 w-4 text-indigo-300" />
                                        <h5 className="text-sm font-medium text-gray-100">General Career Advice</h5>
                                    </div>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-300 text-sm">
                                        {aiAdvice.nextStepsToImproveCareerProspects?.generalCareerAdvice?.map(
                                            (item: string, idx: number) => (
                                                <li key={idx}>{item}</li>
                                            )
                                        )}
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

