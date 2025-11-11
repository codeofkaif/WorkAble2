import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { resumeAPI } from '../services/resumeAPI';

interface ResumeUploadProps {
  onFileExtracted: (extractedData: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileExtracted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['.pdf', '.docx', '.txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Please upload a file in one of these formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setIsExtracting(true);
    setError(null);
    setSuccess(false);

    try {
      // Call backend API to extract text from resume
      const extractedData = await resumeAPI.uploadResume(file);

      // Auto-fill resume fields with extracted data
      if (extractedData && onFileExtracted) {
        onFileExtracted(extractedData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Better error handling
      let errorMessage = 'Failed to extract text from resume. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
        
        if (err.response.status === 401) {
          errorMessage = 'Authentication required. Please login first.';
        } else if (err.response.status === 403) {
          errorMessage = 'Permission denied. Please check your access.';
        } else if (err.response.status === 413) {
          errorMessage = 'File too large. Please upload a file smaller than 10MB.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
      } else {
        // Error in request setup
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileExtension = droppedFile.name.toLowerCase().substring(droppedFile.name.lastIndexOf('.'));
      if (acceptedFormats.includes(fileExtension) && droppedFile.size <= maxFileSize) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(`Please upload a file in one of these formats: ${acceptedFormats.join(', ')} and less than 10MB`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Upload className="w-5 h-5 text-blue-600" />
          <span>Upload Your Resume</span>
        </CardTitle>
        <CardDescription>
          Upload a PDF, DOCX, or TXT file to auto-fill your resume fields
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-blue-400 focus-within:border-blue-500"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
            aria-label="Upload resume file"
          />
          
          {!file ? (
            <label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  Drag and drop your resume here, or{' '}
                  <span className="text-blue-600 hover:text-blue-700 underline">
                    browse
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PDF, DOCX, TXT (Max 10MB)
                </p>
              </div>
            </label>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={isUploading || isExtracting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading || isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting text...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Extract & Auto-fill
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {isExtracting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">
                Resume extracted successfully! Fields have been auto-filled.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;

