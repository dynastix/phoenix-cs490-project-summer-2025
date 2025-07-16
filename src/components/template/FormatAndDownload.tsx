// components/FormatAndDownload.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface Resume {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

interface FormatAndDownloadProps {
  user: User;
}

export default function FormatAndDownload({ user }: FormatAndDownloadProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadResumes();
    loadTemplateSettings();
  }, [user]);

  const loadResumes = async () => {
    try {
      const resumesRef = collection(db, 'users', user.uid, 'userAIResumes');
      const snapshot = await getDocs(resumesRef);
      const resumeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resume[];
      setResumes(resumeList);
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const loadTemplateSettings = async () => {
    try {
      const docRef = doc(db, 'users', user.uid, 'userDocuments', 'stylingTemplateSettings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentTemplate(data.templateSetting);
      }
    } catch (error) {
      console.error('Error loading template settings:', error);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResume(resumeId);
    setFormattedContent('');
  };

  const formatResume = async () => {
    if (!selectedResume || !currentTemplate) return;
    
    setIsProcessing(true);
    try {
      const resume = resumes.find(r => r.id === selectedResume);
      if (!resume) return;

      const response = await fetch('/api/format-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: resume.content,
          templateId: currentTemplate,
        }),
      });

      const data = await response.json();
      setFormattedContent(data.formattedContent);
    } catch (error) {
      console.error('Error formatting resume:', error);
      alert('Error formatting resume');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = async () => {
    if (!formattedContent) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latexContent: formattedContent,
          format: 'pdf',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${selectedResume}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadDOCX = async () => {
    if (!formattedContent) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latexContent: formattedContent,
          format: 'docx',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${selectedResume}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to generate DOCX');
      }
    } catch (error) {
      console.error('Error downloading DOCX:', error);
      alert('Error downloading DOCX');
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedResumeData = resumes.find(r => r.id === selectedResume);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Selection and Controls */}
      <div className="space-y-6">
        {/* Resume Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Select Resume to Format</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => handleResumeSelect(resume.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedResume === resume.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{resume.title}</div>
                <div className="text-sm text-gray-500 truncate">
                  {resume.content.substring(0, 100)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Current Template</h3>
          {currentTemplate ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800 font-medium">Template: {currentTemplate}</div>
              <div className="text-sm text-green-600">Template settings loaded successfully</div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-800 font-medium">No template selected</div>
              <div className="text-sm text-yellow-600">
                Please select a template in the Template Selection tab first
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            <button
              onClick={formatResume}
              disabled={!selectedResume || !currentTemplate || isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Formatting...' : 'Format Resume'}
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={downloadPDF}
                disabled={!formattedContent || isDownloading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
              
              <button
                onClick={downloadDOCX}
                disabled={!formattedContent || isDownloading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? 'Downloading...' : 'Download DOCX'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Formatted Resume Preview</h3>
        
        {selectedResumeData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{selectedResumeData.title}</h4>
            <p className="text-sm text-gray-600">
              Template: {currentTemplate || 'No template selected'}
            </p>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[500px]">
          {formattedContent ? (
            <div className="font-mono text-xs whitespace-pre-wrap overflow-auto max-h-[500px]">
              {formattedContent}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {selectedResume && currentTemplate
                ? 'Click "Format Resume" to see the formatted output'
                : 'Select a resume and ensure template is configured'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}