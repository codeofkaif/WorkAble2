import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityState {
  highContrast: boolean;
  fontSize: number;
  keyboardOnly: boolean;
  voiceCommands: boolean;
  screenReader: boolean;
  language: 'en' | 'hi'; // English or Hindi
}

interface AccessibilityContextType {
  state: AccessibilityState;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleKeyboardOnly: () => void;
  toggleVoiceCommands: () => void;
  toggleScreenReader: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  toggleLanguage: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [state, setState] = useState<AccessibilityState>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      highContrast: false,
      fontSize: 16,
      keyboardOnly: false,
      voiceCommands: false,
      screenReader: true,
      language: 'en', // Default to English
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(state));
    
    // Apply high contrast theme
    if (state.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply font size
    document.documentElement.style.fontSize = `${state.fontSize}px`;
    
    // Apply keyboard-only mode
    if (state.keyboardOnly) {
      document.documentElement.classList.add('keyboard-only');
    } else {
      document.documentElement.classList.remove('keyboard-only');
    }
  }, [state]);

  const toggleHighContrast = () => {
    setState(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const increaseFontSize = () => {
    setState(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 2, 24) }));
  };

  const decreaseFontSize = () => {
    setState(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 2, 12) }));
  };

  const resetFontSize = () => {
    setState(prev => ({ ...prev, fontSize: 16 }));
  };

  const toggleKeyboardOnly = () => {
    setState(prev => ({ ...prev, keyboardOnly: !prev.keyboardOnly }));
  };

  const toggleVoiceCommands = () => {
    setState(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }));
  };

  const toggleScreenReader = () => {
    setState(prev => ({ ...prev, screenReader: !prev.screenReader }));
  };

  const setLanguage = (lang: 'en' | 'hi') => {
    setState(prev => ({ ...prev, language: lang }));
    // Set HTML lang attribute for screen readers
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setState(prev => {
      const newLang = prev.language === 'en' ? 'hi' : 'en';
      document.documentElement.lang = newLang;
      return { ...prev, language: newLang };
    });
  };

  const value: AccessibilityContextType = {
    state,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleKeyboardOnly,
    toggleVoiceCommands,
    toggleScreenReader,
    setLanguage,
    toggleLanguage,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
