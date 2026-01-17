const mongoose = require('mongoose');

/**
 * Job Model
 * Stores job postings created by employers
 */
const jobSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  // Job Details
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [3000, 'Requirements cannot exceed 3000 characters']
  },
  
  // Job Type & Status
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  workMode: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    default: 'mid'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  
  // Compensation
  salaryRange: {
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  
  // Skills & Requirements
  skillsRequired: [{
    type: String,
    trim: true
  }],
  
  // Accessibility Features
  accessibilitySupport: [{
    type: String,
    trim: true
    // Examples: 'screen-reader', 'keyboard-navigation', 'high-contrast', 
    // 'voice-control', 'captioning', 'flex-hours', 'remote-first', etc.
  }],
  
  // Additional Information
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  benefits: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  
  // Employer Information
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Job must be posted by an employer']
  },
  
  // Application Settings
  applicationDeadline: {
    type: Date,
    default: null
  },
  maxApplications: {
    type: Number,
    default: null // null means unlimited
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ status: 1, isActive: 1 });
jobSchema.index({ location: 1, workMode: 1 });
jobSchema.index({ type: 1, experienceLevel: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ createdAt: -1 }); // For sorting by newest

// Virtual for application deadline status
jobSchema.virtual('isExpired').get(function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment application count
jobSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);

