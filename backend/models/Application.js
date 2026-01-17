const mongoose = require('mongoose');

/**
 * Application Model
 * Stores job applications submitted by job seekers
 */
const applicationSchema = new mongoose.Schema({
  // Job Reference
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  
  // Applicant Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null // Optional, user might apply without resume
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'interview', 'offer', 'withdrawn'],
    default: 'pending'
  },
  
  // Application Details
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Employer Notes (visible only to employer)
  employerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Employer notes cannot exceed 1000 characters']
  },
  
  // Interview Information
  interview: {
    scheduledDate: {
      type: Date,
      default: null
    },
    interviewType: {
      type: String,
      enum: ['phone', 'video', 'onsite', 'other'],
      default: null
    },
    location: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Interview notes cannot exceed 500 characters']
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  
  // Offer Information
  offer: {
    salary: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'USD'
    },
    startDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Offer notes cannot exceed 500 characters']
    },
    accepted: {
      type: Boolean,
      default: false
    }
  },
  
  // Application Metadata
  appliedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  viewedByEmployer: {
    type: Boolean,
    default: false
  },
  viewedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, isActive: 1 });
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ appliedDate: -1 }); // For sorting by newest
applicationSchema.index({ status: 1, appliedDate: -1 });

// Pre-save middleware to update lastUpdated
applicationSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

// Method to update status
applicationSchema.methods.updateStatus = function(newStatus, notes = null) {
  this.status = newStatus;
  this.lastUpdated = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Method to mark as viewed by employer
applicationSchema.methods.markAsViewed = function() {
  if (!this.viewedByEmployer) {
    this.viewedByEmployer = true;
    this.viewedDate = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get application statistics for a user
applicationSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    interview: 0,
    offer: 0,
    withdrawn: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get application statistics for a job
applicationSchema.statics.getJobStats = async function(jobId) {
  const stats = await this.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId), isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0,
    interview: 0,
    offer: 0,
    withdrawn: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

module.exports = mongoose.model('Application', applicationSchema);

