// Accessibility Types
export interface AccessibilityState {
  highContrast: boolean;
  fontSize: number;
  keyboardOnly: boolean;
  voiceCommands: boolean;
  screenReader: boolean;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  enabled?: boolean;
}

// ARIA Types
export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-busy'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-owns'?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
}

// Focus Management Types
export interface FocusOptions {
  preventScroll?: boolean;
  focusVisible?: boolean;
}

export interface FocusableElement {
  focus(options?: FocusOptions): void;
  blur(): void;
  tabIndex: number;
  disabled?: boolean;
  hidden?: boolean;
  style?: CSSStyleDeclaration;
}

// High Contrast Theme Types
export interface HighContrastColors {
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  background: {
    primary: string;
    secondary: string;
    overlay: string;
  };
}

// Screen Reader Types
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high';
  timeout?: number;
}

// Voice Command Types
export interface VoiceCommandResult {
  success: boolean;
  command: string;
  confidence: number;
  transcript: string;
  error?: string;
}

// Accessibility Preferences
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardOnly: boolean;
  voiceCommands: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
}
