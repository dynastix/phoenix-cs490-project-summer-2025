// components/TemplateSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

interface Resume {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  latexTemplate: string;
}

interface TemplateSelectorProps {
  user: User;
  onTemplateSelect: (templateId: string) => void;
  selectedTemplate: string | null;
}

export default function TemplateSelector({ user, onTemplateSelect, selectedTemplate }: TemplateSelectorProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadResumes();
    loadTemplates();
    loadCurrentTemplate();
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

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const templateData = await response.json();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadCurrentTemplate = async () => {
    try {
      const docRef = doc(db, 'users', user.uid, 'userDocuments', 'stylingTemplateSettings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentTemplate(data.templateSetting);
        onTemplateSelect(data.templateSetting);
      }
    } catch (error) {
      console.error('Error loading current template:', error);
    }
  };

  const handleResumeSelect = async (resumeId: string) => {
    setSelectedResume(resumeId);
    const resume = resumes.find(r => r.id === resumeId);
    if (resume) {
      setResumeContent(resume.content);
      setPreviewContent('');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setCurrentTemplate(templateId);
    onTemplateSelect(templateId);
  };

  const generatePreview = async () => {
    if (!selectedResume || !currentTemplate || !resumeContent) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/format-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent,
          templateId: currentTemplate,
        }),
      });

      const data = await response.json();
      setPreviewContent(data.formattedContent);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplateSettings = async () => {
    if (!currentTemplate) return;
    
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'userDocuments', 'stylingTemplateSettings');
      await setDoc(docRef, {
        templateSetting: currentTemplate,
        updatedAt: new Date(),
      });
      
      alert('Template settings saved successfully!');
    } catch (error) {
      console.error('Error saving template settings:', error);
      alert('Error saving template settings');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === currentTemplate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Selection */}
      <div className="space-y-6">
        {/* Resume Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Select Resume</h3>
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

        {/* Template Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Select Template</h3>
          <div className="space-y-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  currentTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-20 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                    <Image
                      src={template.imageUrl}
                      alt={template.name}
                      width={64}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={generatePreview}
            disabled={!selectedResume || !currentTemplate || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Preview'}
          </button>
          <button
            onClick={saveTemplateSettings}
            disabled={!currentTemplate || isSaving}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        
        {selectedTemplateData && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{selectedTemplateData.name}</h4>
            <p className="text-sm text-gray-600">{selectedTemplateData.description}</p>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[400px]">
          {previewContent ? (
            <div className="font-mono text-sm whitespace-pre-wrap">
              {previewContent}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {selectedResume && currentTemplate
                ? 'Click "Generate Preview" to see the formatted resume'
                : 'Select a resume and template to see preview'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}