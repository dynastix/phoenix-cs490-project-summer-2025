// components/ResumeTemplateManager.tsx
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';

import TemplateSelector from './TemplateSelector';
import FormatAndDownload from './FormatAndDownload';

interface ResumeTemplateManagerProps {
  user: User;
}

export default function ResumeTemplateManager({ user }: ResumeTemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'download'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Template Manager</h1>
        <p className="text-gray-600">Select templates and format your AI-generated resumes</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('template')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'template'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Template Selection
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'download'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Format & Download
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'template' && (
          <TemplateSelector 
            user={user} 
            onTemplateSelect={setSelectedTemplate}
            selectedTemplate={selectedTemplate}
          />
        )}
        {activeTab === 'download' && (
          <FormatAndDownload user={user} />
        )}
      </div>
    </div>
  );
}