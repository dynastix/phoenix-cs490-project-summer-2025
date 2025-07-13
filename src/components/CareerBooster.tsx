'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import { updateDoc, doc as docRef } from 'firebase/firestore';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import UserJobDescriptionList from "@/components/UserJobDescriptionList";
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import generateNewCareerAdvicePrompt from '@/lib/prompts/generateNewCareerAdvice';
import baseCareerAdvicePrompt from '@/lib/prompts/careerAdvice';
import { formatDate } from '@/utils/formatDate';
import {
    LightBulbIcon,
    ChartBarIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';


interface AIResumeData {
    id: string;
    resumeContent: string;
    jobTitle: string;
    companyName: string;
    createdAt: string;
    docType: 'AI';
    docPath: string;
    fileName: string;
}

const CareerBooster = () => {
    const [selectedResume, setSelectedResume] = useState('');
    const [aiAdvice, setAiAdvice] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [userDocuments, setUserDocuments] = useState<DocumentData[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [selectedJobDescription, setSelectedJobDescription] = useState<JobDescription | null>(null);
    const currentResume = userDocuments.find(doc => doc.docPath === selectedResume);

    useEffect(() => {
        const fetchAIResumes = async (uid: string): Promise<AIResumeData[]> => {
            try {
                const aiResumesRef = collection(db, 'users', uid, 'userAIResumes');
                const q = query(aiResumesRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const aiResumes: AIResumeData[] = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    aiResumes.push({
                        id: doc.id,
                        resumeContent: data.resumeContent || '',
                        jobTitle: data.jobTitle || 'Unknown Position',
                        companyName: data.companyName || 'Unknown Company',
                        createdAt: data.createdAt || '',
                        docType: 'AI',
                        docPath: `ai:${doc.id}`,
                        fileName: `${data.jobTitle} at ${data.companyName} (AI Resume)`,
                        aiCareerAdvice: data.aiCareerAdvice || null
                    });
                });

                return aiResumes;
            } catch (err) {
                console.error('Error fetching AI resumes:', err);
                return [];
            }
        };

        const fetchDocuments = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;

                const uid = user.uid;

                // Fetch uploaded documents dynamically
                const userDocsRef = collection(db, 'users', uid, 'userDocuments');
                const userDocsSnapshot = await getDocs(userDocsRef);
                const uploadedDocs: DocumentData[] = [];

                userDocsSnapshot.forEach(doc => {
                    const data = doc.data();
                    uploadedDocs.push({
                        fileName: data.fileName || 'Untitled',
                        fileType: data.fileType || 'Unknown',
                        text: data.text || '',
                        uploadedAt: data.uploadedAt || null,
                        docType: data.docType || 'Unknown',
                        docPath: doc.id,
                        aiCareerAdvice: data.aiCareerAdvice || null,
                    });
                });

                const aiResumes = await fetchAIResumes(uid);

                const aiAsDocData: DocumentData[] = aiResumes.map(ai => ({
                    fileName: ai.fileName,
                    fileType: 'AI',
                    text: ai.resumeContent,
                    uploadedAt: ai.createdAt,
                    docType: 'AI',
                    docPath: ai.docPath,
                    aiCareerAdvice: ai.aiCareerAdvice || null
                }));

                const combined = [...uploadedDocs, ...aiAsDocData];
                setUserDocuments(combined);
            } catch (err) {
                console.error('Error fetching documents:', err);
            } finally {
                setLoadingDocs(false);
            }
        };

        if (currentResume?.aiCareerAdvice) {
            setAiAdvice(currentResume.aiCareerAdvice);
        } else {
            setAiAdvice(null);
        }


        fetchDocuments();
    }, [selectedResume, currentResume]);

    // Dummy resume list with mock content
    const resumeOptions = [
        { id: 'resume1', name: 'Software Engineer Resume', content: 'Experience: 5+ years\nSkills: React, Node.js, AWS\nProjects: Portfolio site, E-commerce backend...' },
        { id: 'resume2', name: 'Product Manager Resume', content: 'Experience: 4+ years\nSkills: Agile, Roadmapping, Stakeholder Management\nProjects: Mobile App Launch, SaaS Platform Design...' },
        { id: 'resume3', name: 'Data Analyst Resume', content: 'Experience: 3+ years\nSkills: SQL, Python, Tableau\nProjects: Sales Dashboards, Customer Insights Report...' },
    ];

    const mimeTypeToLabel = (mimeType: string) => {
        if (!mimeType) return 'Unknown';
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType === 'text/plain') return 'TXT';
        if (mimeType === 'application/msword') return 'DOC';
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
        // Add more mappings as needed
        return mimeType; // fallback to raw MIME type if no mapping
    };


    const handleGenerateAdvice = async () => {
        if (!currentResume || !selectedResume) return;

        setAiAdvice({ status: 'loading' });

        try {
            const hasPreviousAdvice = currentResume.aiCareerAdvice !== null;
            const previousAdviceText = hasPreviousAdvice
                ? JSON.stringify(currentResume.aiCareerAdvice, null, 2)
                : '';

            const prompt = hasPreviousAdvice
                ? generateNewCareerAdvicePrompt(currentResume.text, previousAdviceText)
                : `${baseCareerAdvicePrompt}${currentResume.text}`;

            const response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentResume.text,
                    prompt,
                }),
            });

            if (!response.ok) throw new Error('Groq API request failed');

            const { response: groqText } = await response.json();
            const parsed = JSON.parse(groqText);
            setAiAdvice(parsed);

            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const docPathParts = selectedResume.startsWith('ai:')
                ? ['userAIResumes', selectedResume.split(':')[1]]
                : ['userDocuments', selectedResume];

            const resumeDocRef = docRef(db, 'users', user.uid, ...docPathParts);
            await updateDoc(resumeDocRef, { aiCareerAdvice: parsed });

            setUserDocuments(prev =>
                prev.map(doc =>
                    doc.docPath === selectedResume
                        ? { ...doc, aiCareerAdvice: parsed }
                        : doc
                )
            );
        } catch (error) {
            console.error('Error generating or saving advice:', error);
            setAiAdvice({ status: 'error', message: 'Failed to generate advice.' });
        }
    };




    // const currentResume = resumeOptions.find((resume) => resume.id === selectedResume);
    //   const response = await callGroqAPI(resumeText, careerAdvicePrompt);

    return (
        <div className="max-w-9xl mx-auto px-6 space-y-6">
            <h2 className="text-2xl font-semibold">Career Booster</h2>

            {/* Resume and Job Description Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Resume Selector */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Select a Resume</h3>
                    <select
                        value={selectedResume}
                        onChange={(e) => setSelectedResume(e.target.value)}
                        className="w-full bg-zinc-800 text-zinc-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Select Resume --</option>
                        {userDocuments
                            .filter((doc) => doc.fileName && doc.fileName !== 'Untitled')
                            .map((doc) => (
                                <option key={doc.docPath} value={doc.docPath}>
                                    {doc.fileName} {doc.docType === 'AI' ? '(AI)' : ''}
                                </option>
                            ))}
                    </select>

                    {/* Display View - Scrollable */}
                    {currentResume && (
                        <div className="mt-4 bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-h-[400px] overflow-y-auto whitespace-pre-wrap text-zinc-200 leading-relaxed">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm px-3 py-1 rounded-full bg-zinc-800">
                                    {mimeTypeToLabel(currentResume.docType) || 'Resume'}
                                </span>
                                <span className="text-sm text-zinc-400">
                                    Created: {formatDate(currentResume.uploadedAt || currentResume.createdAt || '')}
                                </span>
                            </div>
                            {currentResume.text || currentResume.resumeContent}
                        </div>
                    )}
                    {/* Actions */}
                    <div className="flex space-x-4" style={{ marginTop: '2rem' }}>
                        {selectedResume && (
                            <button
                                onClick={handleGenerateAdvice}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {currentResume?.aiCareerAdvice || aiAdvice
                                    ? 'Regenerate AI Advice'
                                    : 'Get AI Career Advice'}
                            </button>
                        )}

                    </div>
                </div>


                {/* Job Description Selector */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Select a Job Description</h3>
                    <div className="rounded h-[580px] overflow-y-auto">
                        <UserJobDescriptionList
                            selectedJob={selectedJobDescription}
                            onSelect={setSelectedJobDescription}
                        />
                        {selectedJobDescription && (
                            <div className="mt-4 p-4 border border-zinc-700 rounded bg-zinc-900">
                                <h4 className="text-lg font-semibold text-white mb-2">
                                    {selectedJobDescription.jobTitle} at {selectedJobDescription.companyName}
                                </h4>
                                <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                                    {selectedJobDescription.jobDescription}
                                </p>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Resume Preview */}
            {showPreview && currentResume && (
                <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                    <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {currentResume.text}
                    </pre>
                </div>
            )}
            {loadingDocs ? (
                <p className="text-gray-400 italic">Loading your documents...</p>
            ) : userDocuments.length === 0 ? (
                <p className="text-gray-400 italic">No documents uploaded yet.</p>
            ) : null}

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

