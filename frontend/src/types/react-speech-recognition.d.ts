declare module 'react-speech-recognition' {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    language?: string;
  }

  export interface SpeechRecognitionState {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  export function useSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionState;
  
  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
  };
  
  export default SpeechRecognition;
}
