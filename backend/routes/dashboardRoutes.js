const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { buildRecommendations } = require('../services/jobRecommendationService');

/**
 * GET /api/dashboard
 * Returns dashboard data based on user role
 * - Job Seeker: stats, recommended jobs, profile completion
 * - Employer: jobs posted, applications, shortlisted candidates
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Determine user role (default to job_seeker if not set)
    const userRole = user.role || 'job_seeker';

    if (userRole === 'employer') {
      // Employer Dashboard Data - Using real data from Job and Application models
      
      // Get job statistics
      const jobsPosted = await Job.countDocuments({ postedBy: user._id, isActive: true });
      const activeJobs = await Job.countDocuments({ 
        postedBy: user._id, 
        isActive: true, 
        status: 'active' 
      });

      // Get application statistics
      const employerJobs = await Job.find({ postedBy: user._id, isActive: true }).select('_id');
      const jobIds = employerJobs.map(job => job._id);
      
      const applicationsReceived = await Application.countDocuments({
        jobId: { $in: jobIds },
        isActive: true
      });

      const shortlistedCandidates = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'shortlisted',
        isActive: true
      });

      // Get recent applications (last 10)
      const recentApplications = await Application.find({
        jobId: { $in: jobIds },
        isActive: true
      })
        .populate('userId', 'name email avatar')
        .populate('jobId', 'title')
        .sort('-appliedDate')
        .limit(10)
        .select('userId jobId appliedDate status')
        .lean();

      const formattedApplications = recentApplications.map(app => ({
        id: app._id.toString(),
        candidateName: app.userId?.name || 'Unknown',
        jobTitle: app.jobId?.title || 'Unknown',
        appliedDate: app.appliedDate || app.createdAt,
        status: app.status
      }));

      const dashboardData = {
        role: 'employer',
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar
        },
        stats: {
          jobsPosted,
          applicationsReceived,
          shortlistedCandidates,
          activeJobs
        },
        recentApplications: formattedApplications
      };

      return res.json({
        status: 'success',
        data: dashboardData
      });
    } else {
      // Job Seeker Dashboard Data
      
      // Calculate profile completion percentage from actual user data
      let completionScore = 0;
      let totalFields = 0;
      
      // Check required fields
      if (user.name) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.email) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.location) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.summary) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.skills && user.skills.length > 0) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.experience && user.experience.length > 0) { completionScore++; totalFields++; } else { totalFields++; }
      if (user.education && user.education.length > 0) { completionScore++; totalFields++; } else { totalFields++; }
      
      const profileCompletion = Math.round((completionScore / totalFields) * 100);

      // Get actual application statistics from Application model
      const applicationStats = await Application.getUserStats(user._id);

      const stats = {
        jobsApplied: applicationStats.total || 0,
        shortlisted: applicationStats.shortlisted || 0,
        rejected: applicationStats.rejected || 0,
        interviews: applicationStats.interview || 0
      };

      // Get recommended jobs using actual user data and jobRecommendationService
      const recommendedJobsData = buildRecommendations(user);
      
      // Format recommended jobs to match frontend interface
      const recommendedJobs = recommendedJobsData.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type === 'full-time' ? 'Full-time' : job.type === 'part-time' ? 'Part-time' : job.type === 'contract' ? 'Contract' : 'Full-time',
        salary: job.salaryRange,
        matchScore: job.matchScore,
        postedDate: new Date().toISOString().split('T')[0] // Current date as posted date
      }));

      const dashboardData = {
        role: 'job_seeker',
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          location: user.location || 'Not set'
        },
        profileCompletion,
        stats,
        recommendedJobs
      };

      return res.json({
        status: 'success',
        data: dashboardData
      });
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

