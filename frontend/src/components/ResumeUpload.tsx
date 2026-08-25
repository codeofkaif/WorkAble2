import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Clipboard, X, Loader2, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { resumeAPI } from '../services/resumeAPI';

interface ResumeUploadProps {
  onFileExtracted: (extractedData: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileExtracted }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [syncProfile, setSyncProfile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['.pdf', '.docx', '.txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Please upload a file in one of these formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccessMessage(null);
  };

  const handleUploadFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const extractedData = await resumeAPI.uploadResume(file);
      if (extractedData && onFileExtracted) {
        onFileExtracted(extractedData);
        setSuccessMessage('Resume extracted successfully! Form, Preview & Profile have been updated.');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to extract text from resume file. Try pasting the text directly in the Paste Text tab.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseText = async () => {
    if (!pastedText.trim()) {
      setError('Please paste your resume text before proceeding.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const extractedData = await resumeAPI.parseText(pastedText, syncProfile, 'modern');
      if (extractedData && onFileExtracted) {
        onFileExtracted(extractedData);
        setSuccessMessage('Resume text parsed successfully! Form, Live Preview & Profile are ready.');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Parse text error:', err);
      setError(err.message || 'Failed to parse resume text. Please check the text and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setSuccessMessage(null);
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
        setError(`Please upload a file in one of these formats: ${acceptedFormats.join(', ')} (Max 10MB)`);
      }
    }
  };

  return (
    <Card className="mb-6 border-navy-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center space-x-2 text-lg font-bold text-gray-900">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Instant Resume & Profile Builder</span>
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Paste your resume text or upload a file to auto-populate your Resume and User Profile in 1-click.
            </CardDescription>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('paste'); setError(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'paste'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); setError(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF/DOCX</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Profile Auto-Sync Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-sm">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">Auto-sync skills & details to my User Profile</span>
          </div>
          <input
            type="checkbox"
            id="syncProfileCheckbox"
            checked={syncProfile}
            onChange={(e) => setSyncProfile(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Tab 1: Paste Text Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <Textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your raw resume text here (Name, Summary, Skills, Experience, Education, Projects)..."
              className="w-full font-mono text-xs sm:text-sm bg-gray-50/50 focus:bg-white border-gray-200 resize-y"
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{pastedText.length} characters</span>
              {pastedText && (
                <button
                  type="button"
                  onClick={() => setPastedText('')}
                  className="text-red-500 hover:underline"
                >
                  Clear text
                </button>
              )}
            </div>
            <Button
              onClick={handleParseText}
              disabled={isProcessing || !pastedText.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Resume & Profile with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Build Resume & Profile in 1-Click
                </>
              )}
            </Button>
          </div>
        )}

        {/* Tab 2: Upload File Mode */}
        {activeTab === 'upload' && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors hover:border-blue-400 focus-within:border-blue-500 bg-gray-50/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload-input"
              aria-label="Upload resume file"
            />

            {!file ? (
              <label
                htmlFor="resume-upload-input"
                className="cursor-pointer flex flex-col items-center space-y-3"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium text-sm">
                    Drag and drop your resume, or{' '}
                    <span className="text-blue-600 hover:text-blue-700 underline font-semibold">
                      browse files
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports PDF, DOCX, TXT (Max 10MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <Button
                  onClick={handleUploadFile}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting & Syncing Profile...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Extract & Auto-fill
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-2.5 text-sm text-green-800"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Success!</p>
                <p>{successMessage}</p>
              </div>
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
              className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-sm text-red-800"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Notice</p>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
