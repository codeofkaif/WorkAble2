import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { resumeAPI, ResumeData } from '../services/resumeAPI';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface AIGeneratorProps {
  onResumeGenerated: (resumeData: ResumeData) => void;
  selectedTemplate: 'modern' | 'classic' | 'creative' | 'minimal';
  onTemplateChange: (template: 'modern' | 'classic' | 'creative' | 'minimal') => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({
  onResumeGenerated,
  selectedTemplate,
  onTemplateChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isListening, setIsListening] = useState(false);
  const promptBeforeListeningRef = useRef<string>('');
  const lastTranscriptRef = useRef<string>('');

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update prompt when transcript changes
  useEffect(() => {
    if (listening) {
      // Get the base prompt (what was there before we started listening)
      const basePrompt = promptBeforeListeningRef.current;
      
      // Combine base prompt with current transcript
      // transcript from useSpeechRecognition is cumulative
      const newPrompt = basePrompt + (basePrompt && transcript ? ' ' : '') + (transcript || '');
      
      setPrompt(newPrompt);
    }
  }, [transcript, listening]);

  // Handle when listening stops - save the final prompt
  useEffect(() => {
    if (!listening && isListening === false && promptBeforeListeningRef.current !== '') {
      // When we just stopped listening, the prompt already has the final value
      // Update the ref for next time
      promptBeforeListeningRef.current = prompt;
    }
  }, [listening, isListening, prompt]);

  // Sync listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      SpeechRecognition.stopListening();
      
      // Wait a bit for final transcript, then reset
      setTimeout(() => {
        resetTranscript();
        lastTranscriptRef.current = '';
      }, 500);
    } else {
      // Save current prompt before starting to listen
      promptBeforeListeningRef.current = prompt || '';
      lastTranscriptRef.current = '';
      
      // Reset transcript before starting new session
      resetTranscript();
      
      // Start listening
      try {
        SpeechRecognition.startListening({ 
          continuous: true,
          language: 'en-US',
          interimResults: true
        });
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        setMessage('Failed to start voice input. Please check microphone permissions and try again.');
        setMessageType('error');
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  const templates = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'creative', label: 'Creative' },
    { value: 'minimal', label: 'Minimal' }
  ] as const;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setMessage('Please describe your experience to generate a resume');
      setMessageType('error');
      return;
    }

    setIsGenerating(true);
    setMessage('Generating your resume with AI...');
    setMessageType('info');

    try {
      const generatedResume = await resumeAPI.generateAI({
        prompt: prompt.trim(),
        template: selectedTemplate
      });

      // Call the callback with generated resume data
      onResumeGenerated(generatedResume);
      
      setMessage('Resume generated successfully! 🎉');
      setMessageType('success');
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      setMessage(
        error.response?.data?.message || 
        'Failed to generate resume. Please try again.'
      );
      setMessageType('error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>AI Resume Writer</span>
        </CardTitle>
        <CardDescription>
          Describe your experience by typing or using voice input. Let AI create a professional resume for you.
          {browserSupportsSpeechRecognition && (
            <span className="block mt-1 text-purple-600 font-medium">
              🎤 Voice input available - Perfect for users who prefer speaking over typing
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Area with Voice Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="ai-prompt"
              className="block text-sm font-medium text-gray-700"
            >
              Describe your experience
            </label>
            {browserSupportsSpeechRecognition && (
              <Button
                type="button"
                onClick={toggleListening}
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                className={`flex items-center space-x-2 transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg ring-2 ring-red-300' 
                    : 'border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-300'
                }`}
                aria-label={isListening ? 'Stop voice input. Press to stop recording.' : 'Start voice input. Press to begin speaking.'}
                aria-pressed={isListening}
                title={isListening ? 'Stop voice input (Press to stop)' : 'Start voice input (Press to speak)'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="font-medium">Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="font-medium">🎤 Voice Input</span>
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., I'm a software developer with 5 years of experience in React, Node.js, and Python. I've led multiple projects and have expertise in building scalable web applications..."
              rows={5}
              className="w-full resize-none pr-12 bg-white border-gray-300"
              aria-describedby="ai-prompt-help"
              aria-required="true"
            />
            {isListening && (
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-600 font-medium">Listening...</span>
              </div>
            )}
          </div>
          <p id="ai-prompt-help" className="mt-1 text-sm text-gray-500">
            {browserSupportsSpeechRecognition 
              ? 'Type or use voice input to describe your experience. Be as detailed as possible for better results.'
              : 'Be as detailed as possible for better results'}
          </p>
          
          {/* Voice Input Status */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg shadow-sm"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Mic className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    🎤 Voice Input Active - Listening...
                  </p>
                  <p className="text-xs text-blue-700">
                    Speak clearly into your microphone. Your words will appear in the text area above. 
                    Click "Stop Recording" when you're finished describing your experience.
                  </p>
                  {transcript && (
                    <p className="text-xs text-green-700 mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <strong>Heard:</strong> "{transcript}"
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    💡 Tip: Speak naturally and pause between sentences for better accuracy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Browser Support Warning */}
          {!browserSupportsSpeechRecognition && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Voice input is not supported in your browser. Please use Chrome, Edge, or Safari for voice features.
              </p>
            </div>
          )}
        </div>

        {/* Template Dropdown and Generate Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="template-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Template
            </label>
            <select
              id="template-select"
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
              aria-label="Select resume template"
            >
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg flex items-center space-x-2 ${
                messageType === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : messageType === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : messageType === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  messageType === 'success'
                    ? 'text-green-800'
                    : messageType === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}
              >
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIGenerator;

