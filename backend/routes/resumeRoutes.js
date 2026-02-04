const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getGeminiConnectivityDiagnostics() {
  // Lightweight diagnostics to help debug "Error fetching from .../models"
  // Only called on AI errors in development.
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, message: 'GEMINI_API_KEY not set' };

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
  try {
    const resp = await axios.get(url, { timeout: 6000 });
    const modelNames = Array.isArray(resp.data?.models)
      ? resp.data.models.slice(0, 10).map((m) => m?.name).filter(Boolean)
      : [];
    return {
      ok: true,
      status: resp.status,
      sampleModels: modelNames,
    };
  } catch (e) {
    return {
      ok: false,
      message: e?.message || 'Failed to call models.list',
      status: e?.response?.status,
      responseBody: e?.response?.data,
    };
  }
}

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
      // PDF file - using pdf-parse to extract text
      try {
        const pdfParse = require('pdf-parse');
        
        console.log(`📄 Attempting to parse PDF: ${file.originalname} (${file.size} bytes)`);
        
        // Parse PDF with minimal options - let pdf-parse handle it
        const pdfData = await pdfParse(file.buffer);
        
        extractedText = pdfData.text || '';
        
        console.log(`📄 PDF Info: ${pdfData.numpages} pages, ${extractedText.length} characters extracted`);
        console.log(`📄 First 200 chars: ${extractedText.substring(0, 200)}`);
        
        // More lenient validation - accept any text, even if minimal
        if (!extractedText || extractedText.trim().length === 0) {
          console.warn('⚠️ PDF parsing returned empty text. This might be an image-based PDF.');
          console.warn('⚠️ Attempting to use Gemini AI for extraction...');
          
          // Don't throw error immediately - try Gemini AI first
          extractedText = null; // Mark as failed so we use AI
        } else {
          // Check if we got binary data instead of text (only if very obvious)
          // Be more lenient - only check if it's clearly binary
          const isBinary = extractedText.length < 50 && 
                          (extractedText.includes('%PDF') || 
                           (extractedText.includes('obj') && extractedText.includes('stream')));
          
          if (isBinary) {
            console.warn('⚠️ PDF appears to contain binary data. Trying AI extraction...');
            extractedText = null; // Mark as failed so we use AI
          } else {
            // Clean extracted text - remove excessive whitespace but keep structure
            extractedText = extractedText
              .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
              .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
              .trim();
            
            console.log(`✅ Successfully extracted ${extractedText.length} characters from PDF`);
            console.log(`📄 Sample text: ${extractedText.substring(0, 100)}...`);
          }
        }
        
        // If extraction failed, use Gemini AI
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('PDF text extraction failed or returned empty. Using AI extraction...');
        }
      } catch (pdfError) {
        console.error('PDF Parse Error:', pdfError.message);
        console.error('PDF Error Details:', pdfError);
        console.log('🔄 Attempting AI-based text extraction using Gemini...');
        
        // If pdf-parse fails, try using Gemini AI to extract text from PDF
        if (process.env.GEMINI_API_KEY) {
          try {
            console.log('🔄 Using Gemini AI to extract text from PDF...');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            // Convert PDF buffer to base64
            const base64Pdf = file.buffer.toString('base64');
            const mimeType = 'application/pdf';
            
            console.log(`📦 PDF size: ${file.size} bytes, Base64 length: ${base64Pdf.length} chars`);
            
            // Use Gemini's file upload capability
            // Gemini 1.5 Flash supports PDF files via inlineData
            const prompt = `Extract all text content from this PDF resume document. 
Return ONLY the extracted text content in plain text format. 
Do not include any JSON formatting, explanations, or additional text.
Just return the raw text content from the PDF exactly as it appears.
If the PDF contains images, describe what text you can see in the images.`;

            try {
              // Try using inlineData for PDF (Gemini 1.5 supports this)
              console.log('📤 Sending PDF to Gemini AI via inlineData...');
              const result = await model.generateContent([
                {
                  inlineData: {
                    data: base64Pdf,
                    mimeType: mimeType
                  }
                },
                prompt
              ]);
              
              const response = await result.response;
              extractedText = response.text();
              
              console.log(`📥 Gemini response received: ${extractedText.length} characters`);
              console.log(`📄 First 200 chars from AI: ${extractedText.substring(0, 200)}`);
              
              if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('AI extraction returned empty text');
              }
              
              // Clean the extracted text
              extractedText = extractedText.trim();
              
              console.log(`✅ AI successfully extracted ${extractedText.length} characters from PDF`);
            } catch (inlineDataError) {
              console.error('❌ InlineData method failed:', inlineDataError.message);
              console.error('Error details:', inlineDataError);
              
              // If inlineData doesn't work, try using File API (Gemini 1.5 Pro feature)
              // But for now, let's provide a more helpful error
              throw new Error(`Gemini AI extraction failed: ${inlineDataError.message}. The PDF might be too large, corrupted, or image-based.`);
            }
          } catch (aiError) {
            console.error('❌ AI PDF Extraction Error:', aiError.message);
            console.error('AI Error Stack:', aiError.stack);
            
            // Even if AI fails, try to continue with whatever we have
            // Return a more helpful error but suggest alternatives
            return res.status(400).json({
              status: 'error',
              message: 'Unable to extract text from PDF using both pdf-parse and AI methods.',
              error: process.env.NODE_ENV === 'development' ? {
                pdfError: pdfError.message,
                aiError: aiError.message
              } : undefined,
              possibleReasons: [
                'PDF is image-based (scanned document) - needs OCR',
                'PDF is corrupted or password-protected',
                'PDF contains only images without text',
                'PDF file is too large for processing'
              ],
              solutions: [
                'Convert PDF to text-based PDF: Use Adobe Acrobat, Google Drive (auto OCR), or online OCR tools',
                'Export as TXT/DOCX: Save your resume as .txt or .docx and upload that instead',
                'Use text-based PDF: Ensure your PDF has selectable text (not scanned images)',
                'Try online converters: CloudConvert, IlovePDF, or SmallPDF for OCR conversion'
              ],
              suggestion: 'For best results, upload a text-based PDF or convert to TXT/DOCX format'
            });
          }
        } else {
          console.error('❌ GEMINI_API_KEY not configured');
          return res.status(400).json({
            status: 'error',
            message: 'Failed to extract text from PDF. GEMINI_API_KEY is not configured for AI extraction.',
            error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined,
            suggestion: 'Please configure GEMINI_API_KEY in config.env or convert PDF to TXT/DOCX format'
          });
        }
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

    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({
        status: 'error',
        message: 'AI service is not configured. Please contact administrator.'
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
    
    const geminiModelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: geminiModelName });
    
    const geminiPrompt = `You are a professional resume writer. Generate structured resume data in JSON format.

${aiPrompt}

Please create a professional resume with the following structure:
{
  "personalInfo": {
    "fullName": "string (required)",
    "email": "string (required)",
    "phone": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string (required)",
      "position": "string (required)",
      "startDate": "YYYY-MM-DD (required)",
      "endDate": "YYYY-MM-DD or null",
      "current": false,
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string (required)",
      "degree": "string (required)",
      "field": "string",
      "startDate": "YYYY-MM-DD (required)",
      "endDate": "YYYY-MM-DD or null"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "languages": ["string"]
  },
  "projects": [
    {
      "name": "string (required)",
      "description": "string",
      "technologies": ["string"]
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object.`;

    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const content = response.text();
    
    console.log('Gemini Response (first 500 chars):', content.substring(0, 500));
    
    let aiGeneratedData;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks (```json ... ```)
      cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove markdown code blocks (``` ... ```)
      cleanedContent = cleanedContent.replace(/```\s*/g, '');
      
      // Extract JSON from the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiGeneratedData = JSON.parse(jsonMatch[0]);
      } else {
        aiGeneratedData = JSON.parse(cleanedContent);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Content that failed to parse:', content.substring(0, 1000));
      return res.status(500).json({
        status: 'error',
        message: 'Failed to parse AI response. The AI service returned invalid JSON.',
        error: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

    // Validate and transform data to match Resume schema
    // Ensure required fields are present
    if (!aiGeneratedData.personalInfo) {
      aiGeneratedData.personalInfo = {};
    }
    if (!aiGeneratedData.personalInfo.fullName) {
      aiGeneratedData.personalInfo.fullName = 'Your Name';
    }
    if (!aiGeneratedData.personalInfo.email) {
      aiGeneratedData.personalInfo.email = req.user.email || 'your.email@example.com';
    }

    // Transform experience dates from strings to Date objects
    if (aiGeneratedData.experience && Array.isArray(aiGeneratedData.experience)) {
      aiGeneratedData.experience = aiGeneratedData.experience.map(exp => ({
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        current: exp.current || false
      }));
    } else {
      aiGeneratedData.experience = [];
    }

    // Transform education dates from strings to Date objects
    if (aiGeneratedData.education && Array.isArray(aiGeneratedData.education)) {
      aiGeneratedData.education = aiGeneratedData.education.map(edu => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
        endDate: edu.endDate ? new Date(edu.endDate) : null
      }));
    } else {
      aiGeneratedData.education = [];
    }

    // Ensure skills object structure
    if (!aiGeneratedData.skills) {
      aiGeneratedData.skills = {
        technical: [],
        soft: [],
        languages: []
      };
    }

    // Ensure projects array
    if (!aiGeneratedData.projects) {
      aiGeneratedData.projects = [];
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
    console.error('Error Stack:', error.stack);

    // If Gemini SDK cannot even fetch models list, return actionable diagnostics.
    const errorMessage = error?.message || '';
    const looksLikeGeminiFetch =
      typeof errorMessage === 'string' &&
      (errorMessage.includes('generativelanguage.googleapis.com') ||
        errorMessage.includes('list of available models') ||
        errorMessage.includes('Error fetching from http'));

    let diagnostics;
    if (process.env.NODE_ENV === 'development' && looksLikeGeminiFetch) {
      diagnostics = await getGeminiConnectivityDiagnostics();
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && looksLikeGeminiFetch
        ? {
            hint: 'Gemini API unreachable / API key issue. This is NOT a JSON parsing problem.',
            commonFixes: [
              'Check internet/DNS on your machine (can you open ai.google.dev?)',
              'Verify GEMINI_API_KEY is valid and Gemini API is enabled for the key',
              'Try listing models: curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"',
              'If model is deprecated, set GEMINI_MODEL env var (example: gemini-1.5-flash-latest or another available model from models.list)',
            ],
            diagnostics,
          }
        : {}),
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
