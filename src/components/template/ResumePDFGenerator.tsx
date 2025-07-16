// components/ResumePDFGenerator.tsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface ResumeDocument {
  id: string;
  resumeContent: string;
  title?: string;
  createdAt?: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

interface FormattedResume {
  id: string;
  originalResumeId: string;
  latexContent: string;
  template: string;
  createdAt: any;
  title?: string;
}

const templates: Template[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, modern layout with clear sections and professional typography'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Stylish design with creative elements and modern styling'
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Traditional academic format with emphasis on publications and research'
  }
];

export default function ResumePDFGenerator() {
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedResume, setSelectedResume] = useState<ResumeDocument | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [latexOutput, setLatexOutput] = useState<string>('');
  const [formattedResumeId, setFormattedResumeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showLatexPreview, setShowLatexPreview] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchResumes(currentUser.uid);
      } else {
        setIsLoadingResumes(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchResumes = async (uid: string) => {
    try {
      setIsLoadingResumes(true);
      const resumesCollection = collection(db, 'users', uid, 'userAIResumes');
      const resumesSnapshot = await getDocs(resumesCollection);
      const resumesData: ResumeDocument[] = [];
      
      resumesSnapshot.forEach((doc) => {
        resumesData.push({
          id: doc.id,
          ...doc.data()
        } as ResumeDocument);
      });

      setResumes(resumesData);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to fetch resumes');
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleResumeSelect = async (resumeId: string) => {
    if (!user) return;

    try {
      setSelectedResumeId(resumeId);
      const resumeDoc = doc(db, 'users', user.uid, 'userAIResumes', resumeId);
      const resumeSnapshot = await getDoc(resumeDoc);
      
      if (resumeSnapshot.exists()) {
        setSelectedResume({
          id: resumeId,
          ...resumeSnapshot.data()
        } as ResumeDocument);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      setError('Failed to fetch resume details');
    }
  };

  const saveFormattedResume = async (latexContent: string, template: string) => {
    if (!user || !selectedResume) return null;

    try {
      const formattedResumeId = `${selectedResume.id}_${template}_${Date.now()}`;
      const formattedResumeRef = doc(db, 'users', user.uid, 'formattedAIResumes', formattedResumeId);
      
      const formattedResumeData: Omit<FormattedResume, 'id'> = {
        originalResumeId: selectedResume.id,
        latexContent,
        template,
        createdAt: serverTimestamp(),
        title: selectedResume.title || `Resume ${selectedResume.id}`,
      };

      await setDoc(formattedResumeRef, formattedResumeData);
      return formattedResumeId;
    } catch (error) {
      console.error('Error saving formatted resume:', error);
      throw error;
    }
  };

  const generateLatexResume = async () => {
    if (!selectedResume || !user) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/generate-latex-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: selectedResume.resumeContent,
          template: selectedTemplate,
          uid: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate LaTeX resume');
      }

      const data = await response.json();
      setLatexOutput(data.latexContent);
      
      // Save formatted resume to Firebase
      const savedResumeId = await saveFormattedResume(data.latexContent, selectedTemplate);
      setFormattedResumeId(savedResumeId || '');
      setShowLatexPreview(true);
    } catch (error) {
      console.error('Error generating LaTeX resume:', error);
      setError('Failed to generate LaTeX resume');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!latexOutput) return;

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latexContent: latexOutput,
          filename: `resume_${selectedResume?.id || 'document'}.pdf`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${selectedResume?.id || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to access your resume documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resume PDF Generator
        </h1>
        <p className="text-gray-600">
          Select a resume, choose a template, and generate a professional PDF
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Resume</h2>
            
            {isLoadingResumes ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <p className="text-gray-500 text-sm">No resumes found</p>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResumeId === resume.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleResumeSelect(resume.id)}
                  >
                    <h3 className="font-medium text-sm">
                      {resume.title || `Resume ${resume.id}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {resume.resumeContent.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Selection and Controls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Template Selection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>

            {selectedResume && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Selected Resume Content</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedResume.resumeContent}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={generateLatexResume}
                disabled={!selectedResume || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate LaTeX'}
              </button>

              {showLatexPreview && (
                <>
                  <button
                    onClick={() => setShowLatexPreview(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={downloadPDF}
                    disabled={isLoading || !latexOutput}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LaTeX Preview */}
      {showLatexPreview && latexOutput && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated LaTeX Content</h2>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">
                Template: {selectedTemplate} | Saved ID: {formattedResumeId}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto border">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {latexOutput}
            </pre>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={downloadPDF}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}