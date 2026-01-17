import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Type, 
  Volume2, 
  Keyboard, 
  Mic, 
  MicOff,
  ChevronUp,
  ChevronDown,
  Settings,
  Accessibility,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Languages
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { Button } from './ui/button';

const AccessibilityToolbar: React.FC = () => {
  const {
    state,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleKeyboardOnly,
    toggleVoiceCommands,
    toggleScreenReader,
    toggleLanguage,
  } = useAccessibility();

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Voice commands for navigation
  const voiceCommands = [
    { command: 'go home', action: () => window.location.href = '/', description: 'Navigate to home page' },
    { command: 'go resume', action: () => window.location.href = '/resume', description: 'Navigate to resume builder' },
    { command: 'increase font', action: increaseFontSize, description: 'Increase font size' },
    { command: 'decrease font', action: decreaseFontSize, description: 'Decrease font size' },
    { command: 'high contrast', action: toggleHighContrast, description: 'Toggle high contrast mode' },
    { command: 'keyboard only', action: toggleKeyboardOnly, description: 'Toggle keyboard-only mode' },
  ];

  const { isListening, transcript, error, isSupported, requestMicrophonePermission, toggleListening } = useVoiceCommands(voiceCommands);
  const [microphoneStatus, setMicrophoneStatus] = React.useState<string | null>(null);

  const handleRequestMicrophoneAccess = async () => {
    try {
      setMicrophoneStatus('Requesting microphone access... 🔄');
      
      // This will show the browser permission prompt
      const hasPermission = await requestMicrophonePermission();
      
      if (hasPermission) {
        setMicrophoneStatus('Microphone enabled! ✅');
        setTimeout(() => setMicrophoneStatus(null), 2000);
      } else {
        setMicrophoneStatus('Access denied. Check browser settings. ❌');
        setTimeout(() => setMicrophoneStatus(null), 3000);
      }
    } catch (err) {
      let errorMessage = 'Failed to enable microphone. Try again. ❌';
      
      if (err instanceof Error) {
        if (err.message.includes('denied')) {
          errorMessage = 'Access denied. Allow in browser settings. ❌';
        } else if (err.message.includes('No microphone found')) {
          errorMessage = 'No microphone detected. ❌';
        } else if (err.message.includes('already in use')) {
          errorMessage = 'Microphone in use by another app. ❌';
        }
      }
      
      setMicrophoneStatus(errorMessage);
      setTimeout(() => setMicrophoneStatus(null), 3000);
    }
  };

  return (
    <motion.div 
      className="fixed top-30 right-4 z-50 w-auto max-w-[20rem]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
              <Accessibility className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Accessibility</span>
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-105"
              aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[80vh] overflow-y-auto bg-gradient-to-b from-white-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              {/* Font Size Controls */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <span>Text Size: {state.fontSize}px</span>
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={decreaseFontSize}
                    variant="outline"
                    size="sm"
                    disabled={state.fontSize <= 12}
                    className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 bg-white"
                    aria-label="Decrease font size"
                  >
                    <ZoomOut className="w-4 h-4" />
                    <span className="ml-1">Smaller</span>
                  </Button>
                  <Button
                    onClick={resetFontSize}
                    variant="outline"
                    size="sm"
                    className="bg-white flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                    aria-label="Reset font size to default"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="ml-1">Reset</span>
                  </Button>
                  <Button
                    onClick={increaseFontSize}
                    variant="outline"
                    size="sm"
                    disabled={state.fontSize >= 24}
                    className="bg-white flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200"
                    aria-label="Increase font size"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="ml-1">Larger</span>
                  </Button>
                </div>
              </div>

              {/* Theme Controls */}
              <div className="space-y-2">
                <Button
                  onClick={toggleHighContrast}
                  variant={state.highContrast ? "default" : "outline"}
                  size="sm"
                  className={`w-full transition-all duration-200 bg-white ${
                    state.highContrast 
                      ? 'bg-gradient-to-r from-yellow-500 to-gray-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg' 
                      : 'hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700'
                  }`}
                  aria-pressed={state.highContrast}
                  aria-label="Toggle high contrast mode"
                >
                  {state.highContrast ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  <span className="hidden sm:inline">{state.highContrast ? 'High Contrast ON' : 'High Contrast OFF'}</span>
                  <span className="sm:hidden">{state.highContrast ? 'High Contrast' : 'High Contrast'}</span>
                </Button>

                <Button
                  onClick={toggleKeyboardOnly}
                  variant={state.keyboardOnly ? "default" : "outline"}
                  size="sm"
                  className={`w-full transition-all duration-200 bg-white ${
                    state.keyboardOnly 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                  }`}
                  aria-pressed={state.keyboardOnly}
                  aria-label="Toggle keyboard-only navigation mode"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{state.keyboardOnly ? 'Keyboard Only ON' : 'Keyboard Only OFF'}</span>
                  <span className="sm:hidden">{state.keyboardOnly ? 'Keyboard ON' : 'Keyboard OFF'}</span>
                </Button>

                {/* Language Toggle */}
                <Button
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="w-full transition-all duration-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
                  aria-label={`Switch language to ${state.language === 'en' ? 'Hindi' : 'English'}`}
                >
                  <Languages className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{state.language === 'en' ? 'English → हिंदी' : 'हिंदी → English'}</span>
                  <span className="sm:hidden">{state.language === 'en' ? 'EN → HI' : 'HI → EN'}</span>
                </Button>
              </div>

              {/* Voice Commands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span>Voice Commands</span>
                  </label>
                  <Button
                    onClick={toggleVoiceCommands}
                    variant={state.voiceCommands ? "default" : "outline"}
                    size="sm"
                    className={`text-xs transition-all duration-200 ${
                      state.voiceCommands 
                        ? 'bg-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                        : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700 bg-white'
                    }`}
                    aria-pressed={state.voiceCommands}
                    aria-label="Toggle voice commands"
                  >
                    {state.voiceCommands ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {!state.voiceCommands && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p>🎤 Enable voice commands to navigate using speech.</p>
                  </div>
                )}
                
                {state.voiceCommands && (
                  <div className="space-y-2">
                    {!isSupported && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="font-medium mb-1">⚠️ Voice Recognition Not Available</p>
                        <p>Voice recognition requires HTTPS or localhost and a supported browser (Chrome, Edge, Safari).</p>
                      </div>
                    )}
                    
                    {isSupported && (
                      <Button
                        onClick={handleRequestMicrophoneAccess}
                        variant="default"
                        size="sm"
                        className="bg-white w-full mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-200"
                        aria-label="Request microphone permissions"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Enable Microphone</span>
                        <span className="sm:hidden">Enable Mic</span>
                      </Button>
                    )}
                    
                    {microphoneStatus && (
                      <div className={`text-xs p-3 rounded-lg border transition-all duration-200 ${
                        microphoneStatus.includes('✅') 
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}>
                        {microphoneStatus}
                      </div>
                    )}
                    
                    {state.voiceCommands && isSupported && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-medium mb-1">💡 Voice Commands Ready:</p>
                        <p>Click "Start Listening" to begin using voice commands</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={toggleListening}
                      variant={isListening ? "destructive" : "default"}
                      size="sm"
                      className={`w-full transition-all duration-200 bg-white${
                        isListening 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                      }`}
                      disabled={!isSupported}
                      aria-label={isListening ? 'Stop listening' : 'Start listening for voice commands'}
                    >
                      {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      <span className="hidden sm:inline">{isListening ? 'Stop Listening' : 'Start Listening'}</span>
                      <span className="sm:hidden">{isListening ? 'Stop' : 'Start'}</span>
                    </Button>

                    {isListening && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="font-medium mb-2">🎯 Available Commands:</p>
                        <ul className="space-y-1">
                          {voiceCommands.map((cmd, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-purple-600 dark:text-purple-400 font-mono">"{cmd.command}"</span>
                              <span className="text-gray-500">- {cmd.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {transcript && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-medium mb-1">🎧 Heard:</p>
                        <p className="font-mono">"{transcript}"</p>
                      </div>
                    )}

                    {error && (
                      <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        ❌ Error: {error}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Screen Reader Toggle */}
              <Button
                onClick={toggleScreenReader}
                variant={state.screenReader ? "default" : "outline"}
                size="sm"
                className={`w-full transition-all duration-200 ${
                  state.screenReader 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg' 
                    : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                }`}
                aria-pressed={state.screenReader}
                aria-label="Toggle screen reader support"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{state.screenReader ? 'Screen Reader ON' : 'Screen Reader OFF'}</span>
                <span className="sm:hidden">{state.screenReader ? 'Reader ON' : 'Reader OFF'}</span>
              </Button>

              {/* Keyboard Shortcuts Info */}
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="font-medium mb-2 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Keyboard Shortcuts:</span>
                </p>
                <ul className="space-y-1">
                  <li className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow-sm">Tab</kbd>
                    <span>Navigate</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow-sm">Enter</kbd>
                    <span>Activate</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow-sm">Space</kbd>
                    <span>Toggle</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono shadow-sm">Esc</kbd>
                    <span>Close</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AccessibilityToolbar;
