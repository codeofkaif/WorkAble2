# 🚀 AI-Powered Resume Builder

A comprehensive resume builder integrated into the AI Job Accessibility platform, featuring AI generation, voice input, and PDF export capabilities.

## ✨ Features

### 🤖 AI-Powered Resume Generation
- **OpenAI Integration**: Generate professional resumes using GPT-3.5-turbo
- **Smart Prompts**: Describe your experience and let AI create structured resume content
- **Multiple Templates**: Modern, Classic, Creative, and Minimal design options
- **Professional Content**: AI generates industry-standard resume sections

### 🎤 Voice Input Support
- **Speech Recognition**: Built-in browser speech-to-text functionality
- **Voice Commands**: Speak your resume details instead of typing
- **Accessibility Focus**: Perfect for users with mobility or visual impairments
- **Real-time Processing**: Instant voice-to-text conversion

### 📄 PDF Export
- **Professional Formatting**: Clean, ATS-friendly PDF output
- **Custom Styling**: Multiple template options for different industries
- **High Quality**: Vector-based PDF generation for crisp printing
- **File Naming**: Automatic naming with user's name

### 🔧 Comprehensive Resume Sections
- **Personal Information**: Name, contact details, professional summary
- **Work Experience**: Company, position, dates, achievements
- **Education**: Institution, degree, field, GPA, honors
- **Skills**: Technical, soft skills, and languages
- **Projects**: Portfolio projects with technologies used
- **Certifications**: Professional certifications and credentials
- **Accessibility**: Disability accommodations and preferences

## 🛠️ Technical Implementation

### Backend Architecture

**Node.js Backend** (`backend/`):
```
backend/
├── models/
│   ├── Resume.js          # Resume data model
│   └── User.js            # User authentication model
├── routes/
│   └── resumeRoutes.js    # Resume API endpoints
├── middleware/
│   └── auth.js            # JWT authentication
└── server.js              # Main server with resume routes
```

**Spring Boot Backend** (`backend-java/`) - **NEW!**:
```
backend-java/
├── src/main/java/com/ai/accessibility/
│   ├── controller/
│   │   └── ResumeController.java    # REST endpoints
│   ├── service/
│   │   ├── ResumeService.java       # Business logic
│   │   └── AIResumeService.java     # Gemini AI integration
│   ├── model/
│   │   └── Resume.java              # MongoDB entity
│   ├── repository/
│   │   └── ResumeRepository.java   # Data access
│   └── security/
│       └── JwtUtil.java             # JWT handling
└── src/main/resources/
    └── application.yml              # Configuration
```

**Note:** Both backends expose the same API endpoints and are 100% compatible!

### Frontend Components
```
frontend/src/
├── components/
│   └── ResumeBuilder.tsx  # Main resume builder component
├── services/
│   └── resumeAPI.ts       # Resume API service layer
└── types/
    └── index.ts           # TypeScript interfaces
```

### API Endpoints (Both Backends)

Both Node.js and Spring Boot backends expose identical endpoints:

- `POST /api/resume` - Create new resume (JWT protected)
- `GET /api/resume` - Get user's resumes (JWT protected)
- `GET /api/resume/:id` - Get specific resume (JWT protected)
- `PUT /api/resume/:id` - Update resume (JWT protected)
- `DELETE /api/resume/:id` - Delete resume (JWT protected)
- `POST /api/resume/generate` - AI resume generation (JWT protected)
- `POST /api/resume/upload` - Upload resume file
- `GET /api/resume/:id/pdf` - Download PDF (Node.js only, coming to Spring Boot)

**Note:** All endpoints return the same JSON format and are 100% compatible between backends!

## 🚀 Getting Started

### Prerequisites

**For Node.js Backend:**
- Node.js (v16 or higher)
- MongoDB instance
- Gemini API key (Google Generative AI)
- npm or yarn

**For Spring Boot Backend:**
- Java 17+
- Maven 3.6+
- MongoDB instance (same as Node.js)
- Gemini API key (same as Node.js)

### Backend Setup

#### Option 1: Node.js Backend

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your actual values
   ```

3. **Required Environment Variables**
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-jwt-secret
   MONGODB_URI=your-mongodb-connection-string
   ```

4. **Start Server**
   ```bash
   npm start
   ```

#### Option 2: Spring Boot Backend (Enterprise)

1. **Build Project**
   ```bash
   cd backend-java
   mvn clean package
   ```

2. **Set Environment Variables**
   ```bash
   export MONGODB_URI="your-mongodb-connection-string"
   export JWT_SECRET="your-jwt-secret"
   export GEMINI_API_KEY="your-gemini-api-key"
   export PORT=5001
   ```

3. **Start Server**
   ```bash
   mvn spring-boot:run
   # OR
   java -jar target/accessibility-0.0.1-SNAPSHOT.jar
   ```

**Note:** Both backends use the same MongoDB database and API endpoints. Frontend works with either backend without any changes!

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

## 🎯 Usage Guide

### Creating a Resume

1. **AI Generation**
   - Enter a detailed description of your experience
   - Select your preferred template
   - Click "Generate AI Resume"
   - Review and edit the generated content

2. **Manual Entry**
   - Fill in personal information
   - Add work experience details
   - Include education and skills
   - Set accessibility preferences

3. **Voice Input**
   - Click the microphone button
   - Speak your resume details
   - Voice will be converted to text automatically

### Customizing Your Resume

- **Template Selection**: Choose from 4 professional templates
- **Content Editing**: Modify any section as needed
- **Real-time Preview**: See changes instantly
- **Professional Formatting**: Industry-standard layout

### Exporting

- **PDF Download**: Generate professional PDF
- **Print Ready**: Optimized for printing
- **ATS Friendly**: Compatible with applicant tracking systems

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **User Isolation**: Users can only access their own resumes
- **Input Validation**: Comprehensive data validation
- **Secure API**: Protected endpoints with middleware

## 🌟 Accessibility Features

- **Screen Reader Support**: Semantic HTML structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Voice Input**: Speech recognition for hands-free use
- **High Contrast**: Clear visual design
- **Disability Accommodations**: Built-in accessibility preferences

## 🔮 Future Enhancements

- **Advanced AI Models**: GPT-4 integration for better content
- **Real-time Collaboration**: Multi-user resume editing
- **Template Customization**: User-defined templates
- **Integration APIs**: LinkedIn, Indeed, and other job platforms
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Resume performance tracking

## 🐛 Troubleshooting

### Common Issues

1. **AI Generation Fails**
   - Check Gemini API key configuration (`GEMINI_API_KEY`)
   - Verify internet connection
   - Ensure prompt is detailed enough
   - For Spring Boot: Check `application.yml` or environment variables

2. **Voice Input Not Working**
   - Check browser permissions for microphone
   - Use HTTPS in production (required for speech recognition)
   - Verify browser compatibility

3. **PDF Generation Issues**
   - Ensure resume content is not empty
   - Check browser console for errors
   - Verify html2canvas compatibility

### Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Limited voice support
- **Edge**: Full support

## 📝 API Documentation

### AI Generation Request
```json
{
  "prompt": "Software developer with 5 years experience in React and Node.js",
  "template": "modern"
}
```

### Resume Data Structure
```json
{
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "summary": "Experienced software developer..."
  },
  "experience": [...],
  "education": [...],
  "skills": {...},
  "template": "modern"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Built with ❤️ for inclusive employment opportunities**
