import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export const useVoiceCommands = (commands: VoiceCommand[]) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get SpeechRecognition constructor with proper typing
  const getSpeechRecognition = useCallback(() => {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }, []);
  
  const recognitionRef = useRef<any>(null);

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      // First check if we already have permission
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissions.state === 'granted') {
        return true;
      }
      
      if (permissions.state === 'denied') {
        return false;
      }
      
      // If permission state is 'prompt', request it
      if (permissions.state === 'prompt') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Microphone permission error:', err);
      return false;
    }
  }, []);

  // Request microphone permissions (this will show the browser prompt)
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Microphone permission request error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          throw new Error('Microphone access denied by user');
        } else if (err.name === 'NotFoundError') {
          throw new Error('No microphone found on this device');
        } else if (err.name === 'NotReadableError') {
          throw new Error('Microphone is already in use by another application');
        }
      }
      throw new Error('Failed to access microphone');
    }
  }, []);

  const startListening = useCallback(async () => {
    // Check if running on HTTPS (required for speech recognition)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Speech recognition requires HTTPS. Please use HTTPS or localhost.');
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Check microphone permissions
    try {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
        return;
      }
    } catch (err) {
      setError('Failed to check microphone permissions. Please try again.');
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognitionCtor();
      recognitionRef.current = recognitionInstance;
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionInstance.onresult = (event: any) => {
        // Each event.results item is a SpeechRecognitionResult which itself is array-like
        const currentTranscript = Array.from(event.results)
          .map((result: any) => {
            // result is array-like of alternatives; take the first alternative's transcript
            const alt = (result && result[0]) || null;
            return alt ? String(alt.transcript) : '';
          })
          .join(' ')
          .toLowerCase();

        setTranscript(currentTranscript);

        // Check for commands
        commands.forEach(({ command, action }) => {
          if (currentTranscript.includes(command.toLowerCase())) {
            action();
            setTranscript('');
          }
        });
      };

      recognitionInstance.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event?.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'aborted':
            // Don't show error for aborted - it's usually intentional
            return;
          default:
            errorMessage = `Speech recognition error: ${event?.error ?? 'unknown'}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionInstance.start();
    } catch (err) {
      setError('Failed to start speech recognition');
    }
  }, [commands, getSpeechRecognition, checkMicrophonePermission]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (err) {
      // ignore stop errors
    }
    setIsListening(false);
    setError(null); // Clear any previous errors when stopping
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Auto-stop after 30 seconds of inactivity
  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => {
        stopListening();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isListening, stopListening]);

  // Check if speech recognition is supported
  const hasLoggedDebug = useRef(false);
  const isSupported = useMemo(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    const hasHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    const hasSupport = !!SpeechRecognitionCtor;
    
    // Debug logging - only once
    if (process.env.NODE_ENV === 'development' && !hasLoggedDebug.current) {
      console.log('Voice Recognition Debug:', {
        hasSpeechRecognition: hasSupport,
        hasHttps,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent
      });
      hasLoggedDebug.current = true;
    }
    
    return hasSupport && hasHttps;
  }, [getSpeechRecognition]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    checkMicrophonePermission,
    requestMicrophonePermission,
    startListening,
    stopListening,
    toggleListening,
  };
};
