# ♿ Accessibility Features

This document outlines all the accessibility features implemented in the AI Job Accessibility platform to ensure it's usable by people with disabilities.

## 🎯 **Overview**

The platform is designed with accessibility as a core principle, following WCAG 2.1 AA guidelines and implementing modern accessibility best practices.

## 🔧 **Implemented Features**

### **1. Screen Reader Support (ARIA Roles)**

#### **Semantic HTML Structure**
- Proper heading hierarchy (h1, h2, h3)
- Landmark roles (`role="main"`, `role="region"`, `role="toolbar"`)
- Descriptive labels and descriptions

#### **ARIA Attributes**
- `aria-label` - Provides accessible names for elements
- `aria-labelledby` - Links elements to their labels
- `aria-describedby` - Provides additional descriptions
- `aria-required` - Indicates required form fields
- `aria-busy` - Shows loading states
- `aria-pressed` - Toggle button states
- `aria-expanded` - Expandable content states

#### **Example Implementation**
```tsx
<div role="region" aria-labelledby="ai-generation-heading">
  <h2 id="ai-generation-heading">AI Resume Generation</h2>
  <textarea 
    aria-describedby="ai-prompt-help"
    aria-required="true"
  />
  <div id="ai-prompt-help" className="sr-only">
    Help text for screen readers
  </div>
</div>
```

### **2. High Contrast Theme Toggle**

#### **Features**
- Toggle between normal and high contrast themes
- High contrast colors (black background, white text, yellow accents)
- Persistent across sessions (saved in localStorage)
- Automatic application to all components

#### **Color Scheme**
```css
.high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #000000;
  --accent: #ffff00;
  --border: #ffffff;
}
```

#### **Usage**
```tsx
const { toggleHighContrast, state } = useAccessibility();

<button onClick={toggleHighContrast}>
  {state.highContrast ? '🔆 High Contrast ON' : '🌙 High Contrast OFF'}
</button>
```

### **3. Font Size Controls**

#### **Features**
- Increase/decrease font size (12px to 24px range)
- Reset to default size (16px)
- Real-time preview
- Persistent settings

#### **Implementation**
```tsx
const { increaseFontSize, decreaseFontSize, resetFontSize, state } = useAccessibility();

<div>
  <button onClick={decreaseFontSize} disabled={state.fontSize <= 12}>A-</button>
  <button onClick={resetFontSize}>Reset</button>
  <button onClick={increaseFontSize} disabled={state.fontSize >= 24}>A+</button>
</div>
```

### **4. Keyboard Navigation Support**

#### **Features**
- Full keyboard navigation (Tab, Enter, Space, Arrow keys)
- Focus indicators with high visibility
- Focus trapping in modals
- Skip links for main content

#### **Keyboard Shortcuts**
- `Tab` - Navigate between elements
- `Enter` - Activate buttons/links
- `Space` - Toggle checkboxes/buttons
- `Escape` - Close modals/panels
- `Arrow keys` - Navigate within components

#### **Focus Management**
```tsx
const { focusFirstElement, trapFocus } = useFocusManagement();

// Focus first element when component mounts
useEffect(() => {
  focusFirstElement();
}, []);

// Trap focus in modal
useEffect(() => {
  return trapFocus(modalRef);
}, []);
```

### **5. Voice Command Navigation**

#### **Features**
- Web Speech API integration
- Voice commands for navigation and actions
- Real-time speech recognition
- Command suggestions and feedback

#### **Available Commands**
- "go home" - Navigate to home page
- "go resume" - Navigate to resume builder
- "increase font" - Increase font size
- "decrease font" - Decrease font size
- "high contrast" - Toggle high contrast
- "keyboard only" - Toggle keyboard mode

#### **Implementation**
```tsx
const voiceCommands = [
  { command: 'go home', action: () => navigate('/'), description: 'Navigate to home' },
  { command: 'increase font', action: increaseFontSize, description: 'Increase font size' }
];

const { isListening, transcript, toggleListening } = useVoiceCommands(voiceCommands);
```

## 🎨 **CSS Accessibility Features**

### **Focus Indicators**
```css
button:focus,
input:focus,
select:focus,
textarea:focus,
a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### **High Contrast Focus**
```css
.high-contrast button:focus,
.high-contrast input:focus {
  outline: 3px solid var(--accent) !important;
  outline-offset: 2px !important;
}
```

### **Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 **Usage Examples**

### **Basic Component with Accessibility**
```tsx
import { useAccessibility } from '../contexts/AccessibilityContext';

const MyComponent = () => {
  const { state } = useAccessibility();
  
  return (
    <div 
      role="region" 
      aria-labelledby="component-title"
      className={state.highContrast ? 'high-contrast' : ''}
    >
      <h2 id="component-title">Component Title</h2>
      <button 
        aria-label="Action button"
        className="focus:ring-2 focus:ring-blue-500"
      >
        Action
      </button>
    </div>
  );
};
```

### **Form with Accessibility**
```tsx
const AccessibleForm = () => {
  return (
    <form role="form" aria-labelledby="form-title">
      <h2 id="form-title">Form Title</h2>
      
      <div>
        <label htmlFor="name-input">Name</label>
        <input
          id="name-input"
          type="text"
          aria-required="true"
          aria-describedby="name-help"
        />
        <div id="name-help" className="sr-only">
          Enter your full name as it appears on official documents
        </div>
      </div>
    </form>
  );
};
```

## 🔍 **Testing Accessibility**

### **Manual Testing**
1. **Keyboard Navigation**: Use Tab, Enter, Space, Arrow keys
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **High Contrast**: Toggle high contrast theme
4. **Font Size**: Test font size controls
5. **Voice Commands**: Test speech recognition

### **Automated Testing**
- Use axe-core for automated accessibility testing
- Lighthouse accessibility audits
- ESLint accessibility rules

### **Browser DevTools**
- Chrome DevTools Accessibility panel
- Firefox Accessibility Inspector
- Safari Web Inspector Accessibility

## 📱 **Mobile Accessibility**

### **Touch Targets**
- Minimum 44x44px touch targets
- Adequate spacing between interactive elements
- Touch-friendly button sizes

### **Voice Commands**
- Mobile-optimized speech recognition
- Touch-friendly accessibility toolbar
- Responsive design for all screen sizes

## 🌐 **Browser Support**

### **Full Support**
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### **Partial Support**
- Internet Explorer 11 (basic accessibility)
- Older mobile browsers (core features)

## 🔮 **Future Enhancements**

### **Planned Features**
- **Braille Display Support**: Integration with refreshable braille displays
- **Eye Tracking**: Eye gaze navigation support
- **Gesture Navigation**: Custom gesture recognition
- **AI Accessibility**: AI-powered accessibility improvements
- **Accessibility Analytics**: User behavior and preference tracking

### **Advanced Voice Commands**
- Natural language processing
- Context-aware commands
- Multi-language support
- Custom command creation

## 📚 **Resources**

### **Standards & Guidelines**
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

### **Testing Tools**
- [axe-core](https://github.com/dequelabs/axe-core)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

### **Screen Readers**
- [NVDA](https://www.nvaccess.org/) (Windows, Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows, Paid)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (macOS/iOS, Free)

---

**Built with ♿ accessibility in mind for inclusive user experience**

