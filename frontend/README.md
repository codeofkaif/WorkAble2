# AI Job Accessibility Platform - Frontend

## 🚀 **Frontend Upgrade Complete!**

This is the upgraded frontend for the AI Job Accessibility platform, featuring a modern, government-grade design with enhanced accessibility features.

## ✨ **New Features & Improvements**

### **🎨 Modern Design System**
- **Navy + Magenta Color Palette**: Professional government-grade appearance
- **shadcn/ui Components**: Consistent, accessible component library
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS v3**: Utility-first CSS framework with custom design tokens

### **♿ Enhanced Accessibility**
- **WCAG 2.1 AA Compliance**: Proper contrast ratios and focus indicators
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML
- **Voice Commands**: Speech recognition for hands-free navigation
- **High Contrast Mode**: Toggle for enhanced visibility
- **Font Size Controls**: Adjustable text sizing (A-, Reset, A+)

### **📱 Responsive Design**
- **Mobile-First Approach**: Optimized for all device sizes
- **Touch-Friendly Interface**: Proper touch targets and gestures
- **Progressive Enhancement**: Works without JavaScript

## 🏗️ **Project Structure**

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx        # Reusable button component
│   │   ├── card.tsx          # Card layout components
│   │   ├── input.tsx         # Form input components
│   │   └── textarea.tsx      # Textarea component
│   ├── Header.tsx            # Modern navigation header
│   ├── Footer.tsx            # Comprehensive footer
│   ├── Home.tsx              # Landing page
│   ├── ResumeBuilder.tsx     # AI-powered resume builder
│   ├── Contact.tsx           # Contact form page
│   └── AccessibilityToolbar.tsx # Accessibility controls
├── contexts/
│   └── AccessibilityContext.tsx # Accessibility state management
├── hooks/
│   ├── useKeyboardNavigation.ts # Keyboard navigation logic
│   └── useVoiceCommands.ts     # Voice command handling
├── lib/
│   └── utils.ts              # Utility functions
└── App.tsx                   # Main application component
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- **Backend:** Node.js backend (`backend/`) OR Spring Boot backend (`backend-java/`) running on port 5001

### **Installation**
```bash
# Install dependencies
npm install

# Create .env file (if not exists)
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### **Development Server**
The application will be available at `http://localhost:3000`

### **Backend Compatibility**
✅ This frontend works with **both backend options**:
- **Node.js Backend** (`backend/`) - Original backend
- **Spring Boot Backend** (`backend-java/`) - Enterprise migration (100% API compatible)

No frontend changes required! Both backends expose the same API endpoints on port 5001.

## 🎯 **Available Routes**

- **`/`** - Home page with hero section and quick links
- **`/resume-builder`** - AI-powered resume builder
- **`/providers`** - Service providers directory (coming soon)
- **`/dashboard`** - User dashboard (coming soon)
- **`/contact`** - Contact form and information
- **`/training`** - Training resources (coming soon)
- **`/interview`** - Interview preparation (coming soon)
- **`/assistive-tools`** - Accessibility tools (coming soon)
- **`/stories`** - Success stories (coming soon)

## 🔧 **Key Components**

### **Header Component**
- Top utility bar with language, saved items, emergency contacts
- Modern logo and branding
- Responsive navigation menu
- CTA button for getting started

### **Accessibility Toolbar**
- Collapsible design for space efficiency
- Font size controls (A-, Reset, A+)
- High contrast toggle
- Voice command activation
- Screen reader support

### **Resume Builder**
- Multi-step form with progress indicator
- AI generation with voice input support
- Live preview functionality
- PDF download capability
- Template selection (Modern, Classic, Creative, Minimal)

### **Home Page**
- Hero section with inclusive messaging
- Global search functionality
- Quick links to all features
- Feature highlights with icons
- Call-to-action sections

## 🎨 **Design System**

### **Color Palette**
- **Navy**: `#102a43` to `#f0f4f8` (Primary brand colors)
- **Magenta**: `#500724` to `#fdf2f8` (Accent colors)
- **Semantic Colors**: Success (green), Warning (yellow), Error (red)

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 12px to 6xl with proper line heights
- **Font Weights**: 300 (light) to 800 (extra bold)

### **Spacing & Layout**
- **Container**: max-width 7xl (80rem)
- **Grid System**: Responsive 1-4 column layouts
- **Spacing Scale**: 4px to 128px increments
- **Border Radius**: xl (0.75rem) to 3xl (1.5rem)

### **Shadows & Effects**
- **Soft**: Subtle shadows for cards
- **Medium**: Enhanced shadows for elevated elements
- **Large**: Prominent shadows for modals and overlays

## ♿ **Accessibility Features**

### **WCAG 2.1 AA Compliance**
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Clear focus rings on all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alternative Text**: Descriptive alt text for images

### **Keyboard Navigation**
- **Tab Order**: Logical tab sequence
- **Skip Links**: Skip to main content functionality
- **Keyboard Shortcuts**: Common shortcuts documented
- **Focus Management**: Proper focus trapping and restoration

### **Screen Reader Support**
- **ARIA Labels**: Comprehensive labeling for all components
- **Live Regions**: Dynamic content announcements
- **Landmarks**: Proper page structure identification
- **Descriptions**: Helpful text for complex interactions

### **Voice Commands**
- **Navigation**: "go home", "go resume"
- **Controls**: "increase font", "high contrast"
- **Accessibility**: "keyboard only", "screen reader"

## 🚀 **Performance Features**

### **Optimizations**
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized images and icons
- **Bundle Analysis**: Optimized JavaScript bundles

### **Build Output**
- **Production Build**: Optimized and minified
- **CSS Extraction**: Separate CSS bundles
- **Asset Optimization**: Compressed static assets
- **Source Maps**: Development debugging support

## 🔒 **Security Features**

- **Content Security Policy**: XSS protection
- **HTTPS Only**: Secure communication
- **Input Validation**: Form input sanitization
- **CSRF Protection**: Cross-site request forgery prevention

## 📱 **Browser Support**

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: NVDA, JAWS, VoiceOver, TalkBack

## 🧪 **Testing**

### **Available Scripts**
```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
npm test -- --watchAll=false --coverage --ci
```

### **Testing Tools**
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **Accessibility Testing**: Automated accessibility checks

## 📚 **Documentation**

### **Component API**
Each component includes:
- **Props Interface**: TypeScript type definitions
- **Usage Examples**: Code snippets and examples
- **Accessibility Notes**: ARIA attributes and keyboard support
- **Styling Options**: Available variants and customization

### **Styling Guide**
- **Tailwind Classes**: Utility class usage
- **Custom CSS**: Component-specific styles
- **Theme Customization**: Color and spacing variables
- **Responsive Design**: Breakpoint strategies

## 🤝 **Contributing**

### **Development Guidelines**
1. **Accessibility First**: All features must be accessible
2. **Mobile Responsive**: Test on multiple device sizes
3. **Performance**: Optimize for Core Web Vitals
4. **Testing**: Include unit and integration tests
5. **Documentation**: Update README and component docs

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **shadcn/ui**: Component library inspiration
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Team**: Frontend framework
- **Accessibility Community**: WCAG guidelines and best practices

---

**Built with ❤️ for accessibility and inclusion**
