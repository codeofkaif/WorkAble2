import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import AIGenerator from './AIGenerator';
import ResumeForm from './ResumeForm';
import ResumePreview, { ResumePreviewHandle } from './ResumePreview';
import { ResumeData } from '../services/resumeAPI';

const ResumeBuilder: React.FC = () => {
  const previewRef = useRef<ResumePreviewHandle>(null);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: []
    },
    projects: [],
    template: 'modern'
  });

  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'creative' | 'minimal'>('modern');

  // Handle file extraction from upload
  const handleFileExtracted = (extractedData: Partial<ResumeData>) => {
    setResumeData(prev => ({
      ...prev,
      ...extractedData,
      template: prev.template
    }));
  };

  // Handle AI-generated resume
  const handleResumeGenerated = (generatedResume: ResumeData) => {
    setResumeData(generatedResume);
    setSelectedTemplate(generatedResume.template || 'modern');
  };

  // Handle template change
  const handleTemplateChange = (template: 'modern' | 'classic' | 'creative' | 'minimal') => {
    setSelectedTemplate(template);
    setResumeData(prev => ({
      ...prev,
      template
    }));
  };

  // Handle resume data updates from form
  const handleResumeDataChange = (data: ResumeData) => {
    setResumeData(data);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
      role="main"
      aria-label="Resume Builder"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            id="page-title"
            tabIndex={0}
          >
            Resume Builder
          </h1>
          <p 
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
            aria-describedby="page-title"
          >
            Create professional, ATS-friendly resumes with AI assistance
          </p>
        </motion.div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Form Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Resume Upload */}
            <ResumeUpload onFileExtracted={handleFileExtracted} />

            {/* AI Generator */}
            <AIGenerator
              onResumeGenerated={handleResumeGenerated}
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />

            {/* Resume Form */}
            <ResumeForm
              resumeData={resumeData}
              onResumeDataChange={handleResumeDataChange}
            />
          </motion.div>

          {/* Right Column: Preview Section */}
          <motion.div 
            className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ResumePreview
              ref={previewRef}
              resumeData={resumeData}
              template={selectedTemplate}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating Export PDF Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => {
            if (previewRef.current) {
              previewRef.current.exportPDF();
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Export resume as PDF"
        >
          <Download className="w-6 h-6" />
          <span className="hidden sm:inline font-medium">Export PDF</span>
        </button>
      </motion.div>
    </div>
  );
};

export default ResumeBuilder;
