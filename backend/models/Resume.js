const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    linkedin: String,
    website: String,
    summary: String
  },
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String],
    skills: [String]
  }],
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    gpa: String,
    honors: [String]
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String]
  },
  projects: [{
    name: { type: String, required: true },
    description: String,
    technologies: [String],
    link: String,
    startDate: Date,
    endDate: Date
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: String,
    date: Date,
    expiryDate: Date,
    link: String
  }],
  accessibility: {
    disabilityType: String,
    accommodations: [String],
    accessibilityPreferences: [String]
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal'],
    default: 'modern'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
resumeSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
