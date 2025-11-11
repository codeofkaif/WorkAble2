const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create new resume
router.post('/', auth, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user.id
    };
    
    const resume = new Resume(resumeData);
    await resume.save();
    
    res.status(201).json({
      status: 'success',
      data: resume
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all resumes for a user
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ updatedAt: -1 });
    
    res.json({
      status: 'success',
      data: resumes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Upload and extract text from resume file (must come before /:id routes)
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileName = file.originalname.toLowerCase();
    let extractedText = '';

    // Extract text based on file type
    if (fileName.endsWith('.txt')) {
      // Plain text file
      extractedText = file.buffer.toString('utf-8');
    } else if (fileName.endsWith('.pdf')) {
      // PDF file - using pdf-parse if available, otherwise use AI to extract
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        // If pdf-parse is not installed, extract text directly from buffer
        extractedText = file.buffer.toString('utf-8').substring(0, 10000);
      }
    } else if (fileName.endsWith('.docx')) {
      // DOCX file - using mammoth if available
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } catch (docxError) {
        // If mammoth is not installed, return error
        return res.status(400).json({
          status: 'error',
          message: 'DOCX parsing requires mammoth package. Please install it or convert to PDF/TXT.'
        });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Unsupported file format. Please upload PDF, DOCX, or TXT files.'
      });
    }

    // If no text extracted, return error
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Could not extract text from file. Please ensure the file contains text.'
      });
    }

    // Use AI to parse extracted text into structured resume data
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const aiPrompt = `Extract structured resume data from the following text. Return a JSON object with this structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ]
}

Extracted text:
${extractedText.substring(0, 15000)}

Return only valid JSON.`;

      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const content = response.text();
      
      let parsedResume;
      try {
        // Clean the response to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResume = JSON.parse(jsonMatch[0]);
        } else {
          parsedResume = JSON.parse(content);
        }
      } catch (parseError) {
        // If parsing fails, return basic structure with extracted text
        parsedResume = {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            summary: extractedText.substring(0, 500)
          },
          experience: [],
          education: [],
          skills: {
            technical: [],
            soft: []
          },
          projects: []
        };
      }

      res.json({
        status: 'success',
        message: 'Resume extracted successfully',
        data: parsedResume
      });
    } catch (aiError) {
      console.error('AI Processing Error:', aiError);
      // If AI fails, return basic structure with extracted text
      res.json({
        status: 'success',
        message: 'Resume extracted (AI processing failed, using basic extraction)',
        data: {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            summary: extractedText.substring(0, 500)
          },
          experience: [],
          education: [],
          skills: {
            technical: [],
            soft: []
          },
          projects: []
        }
      });
    }
    
  } catch (error) {
    console.error('Resume Upload Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extract resume data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// AI-powered resume generation (must come before /:id routes)
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, template = 'modern' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt is required for AI generation'
      });
    }
    
    // OpenAI prompt for resume generation
    const aiPrompt = `Create a professional resume based on the following information. 
    Format it as a structured JSON object with the following sections:
    - personalInfo (fullName, email, phone, summary)
    - experience (array of work experiences)
    - education (array of educational background)
    - skills (technical, soft, languages)
    - projects (array of relevant projects)
    - certifications (array of certifications)
    
    User input: ${prompt}
    
    Make it professional, concise, and tailored for job applications. 
    Focus on achievements and measurable results.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const geminiPrompt = `You are a professional resume writer. Generate structured resume data in JSON format.

${aiPrompt}

Please create a professional resume with the following structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "description": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  }
}

Make it professional, concise, and tailored for job applications. Focus on achievements and measurable results. Return only valid JSON.`;

    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const content = response.text();
    
    let aiGeneratedData;
    try {
      aiGeneratedData = JSON.parse(content);
    } catch (parseError) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to parse AI response'
      });
    }
    
    // Create resume with AI-generated data
    const resumeData = {
      ...aiGeneratedData,
      userId: req.user.id,
      template,
      aiGenerated: true,
      aiPrompt: prompt
    };
    
    const resume = new Resume(resumeData);
    await resume.save();
    
    res.status(201).json({
      status: 'success',
      data: resume,
      message: 'AI-generated resume created successfully'
    });
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate PDF from resume (must come before /:id route)
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });
    
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }
    
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.personalInfo.fullName}_Resume.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF based on template
    generatePDFContent(doc, resume);
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get specific resume (must come after /generate and /:id/pdf)
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isActive: true
    });
    
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }
    
    res.json({
      status: 'success',
      data: resume
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update resume
router.put('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }
    
    res.json({
      status: 'success',
      data: resume
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete resume (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Voice-to-text processing (placeholder for future implementation)
router.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    // This is a placeholder for voice-to-text processing
    // In a real implementation, you would use services like:
    // - Google Speech-to-Text
    // - Azure Speech Services
    // - AWS Transcribe
    
    res.json({
      status: 'success',
      message: 'Voice processing endpoint ready for implementation',
      data: {
        audioReceived: !!req.file,
        fileSize: req.file ? req.file.size : 0
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Helper function to generate PDF content
function generatePDFContent(doc, resume) {
  const { personalInfo, experience, education, skills, projects, certifications } = resume;
  
  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(personalInfo.fullName, { align: 'center' });
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(personalInfo.email, { align: 'center' });
  
  if (personalInfo.phone) {
    doc.text(personalInfo.phone, { align: 'center' });
  }
  
  doc.moveDown(0.5);
  
  // Summary
  if (personalInfo.summary) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Professional Summary');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(personalInfo.summary);
    
    doc.moveDown(0.5);
  }
  
  // Experience
  if (experience && experience.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Professional Experience');
    
    experience.forEach(exp => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${exp.position} at ${exp.company}`);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${new Date(exp.startDate).getFullYear()} - ${exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}`);
      
      if (exp.description) {
        doc.text(exp.description);
      }
      
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          doc.text(`• ${achievement}`);
        });
      }
      
      doc.moveDown(0.3);
    });
  }
  
  // Education
  if (education && education.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Education');
    
    education.forEach(edu => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${edu.degree} in ${edu.field}`);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(edu.institution);
      
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`);
      }
      
      doc.moveDown(0.3);
    });
  }
  
  // Skills
  if (skills) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Skills');
    
    if (skills.technical && skills.technical.length > 0) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Technical: ${skills.technical.join(', ')}`);
    }
    
    if (skills.soft && skills.soft.length > 0) {
      doc.text(`Soft Skills: ${skills.soft.join(', ')}`);
    }
    
    if (skills.languages && skills.languages.length > 0) {
      doc.text(`Languages: ${skills.languages.join(', ')}`);
    }
    
    doc.moveDown(0.5);
  }
  
  // Projects
  if (projects && projects.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Projects');
    
    projects.forEach(project => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(project.name);
      
      if (project.description) {
        doc.fontSize(10)
           .font('Helvetica')
           .text(project.description);
      }
      
      if (project.technologies && project.technologies.length > 0) {
        doc.text(`Technologies: ${project.technologies.join(', ')}`);
      }
      
      doc.moveDown(0.3);
    });
  }
  
  // Certifications
  if (certifications && certifications.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Certifications');
    
    certifications.forEach(cert => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(cert.name);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Issued by: ${cert.issuer}`);
      
      if (cert.date) {
        doc.text(`Date: ${new Date(cert.date).toLocaleDateString()}`);
      }
      
      doc.moveDown(0.3);
    });
  }
}

module.exports = router;
