const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  headline: {
    type: String,
    trim: true,
    maxlength: [120, 'Headline cannot exceed 120 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [1200, 'Summary cannot exceed 1200 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  otp: {
    code: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  disabilityType: {
    type: String,
    required: [true, 'Disability type is required'],
    enum: ['physical', 'visual', 'hearing', 'cognitive', 'mental', 'other', 'none']
  },
  skills: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true }
  },
  experience: [{
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    currentlyWorking: { type: Boolean, default: false },
    summary: { type: String, trim: true },
    achievements: [{
      type: String,
      trim: true
    }],
    technologies: [{
      type: String,
      trim: true
    }]
  }],
  education: [{
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    description: { type: String, trim: true }
  }],
  projects: [{
    name: { type: String, trim: true },
    role: { type: String, trim: true },
    description: { type: String, trim: true },
    impact: { type: String, trim: true },
    technologies: [{
      type: String,
      trim: true
    }]
  }],
  certifications: [{
    name: { type: String, trim: true },
    organization: { type: String, trim: true },
    year: { type: String, trim: true },
    credentialId: { type: String, trim: true }
  }],
  languages: [{
    name: { type: String, trim: true },
    proficiency: {
      type: String,
      trim: true,
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      default: 'intermediate'
    }
  }],
  achievements: [{
    type: String,
    trim: true
  }],
  preferences: {
    workFromHome: {
      type: Boolean,
      default: false
    },
    flexibleHours: {
      type: Boolean,
      default: false
    },
    accessibilityRequirements: [{
      type: String,
      trim: true
    }],
    preferredIndustries: [{
      type: String,
      trim: true
    }],
    salaryRange: {
      min: Number,
      max: Number
    }
  },
  jobPreferences: {
    desiredRoles: [{
      type: String,
      trim: true
    }],
    preferredLocations: [{
      type: String,
      trim: true
    }],
    workModes: [{
      type: String,
      trim: true,
      enum: ['onsite', 'remote', 'hybrid']
    }],
    salaryRange: {
      currency: { type: String, default: 'USD' },
      min: Number,
      max: Number
    },
    experienceLevel: {
      type: String,
      trim: true,
      enum: ['entry', 'mid', 'senior', 'lead']
    },
    availability: {
      type: String,
      trim: true,
      enum: ['immediate', '<30 days', '1-3 months', 'negotiable']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer'],
    default: 'job_seeker'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
