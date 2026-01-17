const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

/**
 * POST /api/applications
 * Apply to a job (Job Seeker only)
 */
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'job_seeker') {
      return res.status(403).json({
        status: 'error',
        message: 'Only job seekers can apply to jobs'
      });
    }

    const { jobId, resumeId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required'
      });
    }

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true, status: 'active' });
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found or not accepting applications'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        status: 'error',
        message: 'Application deadline has passed'
      });
    }

    // Check if max applications reached
    if (job.maxApplications && job.applicationCount >= job.maxApplications) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum applications reached for this job'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: user.id,
      isActive: true
    });

    if (existingApplication) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const application = new Application({
      jobId,
      userId: user.id,
      resumeId: resumeId || null,
      coverLetter: coverLetter || '',
      status: 'pending'
    });

    await application.save();

    // Increment job application count
    await job.incrementApplicationCount();

    res.status(201).json({
      status: 'success',
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/applications
 * Get applications for current user (Job Seeker) or jobs (Employer)
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const { jobId, status, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    if (user.role === 'job_seeker') {
      // Job seeker sees their own applications
      query.userId = user.id;
    } else if (user.role === 'employer') {
      // Employer sees applications for their jobs
      if (!jobId) {
        return res.status(400).json({
          status: 'error',
          message: 'Job ID is required for employers'
        });
      }

      // Verify job belongs to employer
      const job = await Job.findOne({
        _id: jobId,
        postedBy: user.id
      });

      if (!job) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view applications for this job'
        });
      }

      query.jobId = jobId;
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid user role'
      });
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('jobId', 'title company location type workMode')
      .populate('userId', 'name email avatar')
      .populate('resumeId', 'personalInfo')
      .sort('-appliedDate')
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Application.countDocuments(query);

    res.json({
      status: 'success',
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/applications/my-applications
 * Get all applications for current job seeker
 */
router.get('/my-applications', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'job_seeker') {
      return res.status(403).json({
        status: 'error',
        message: 'Only job seekers can view their applications'
      });
    }

    const applications = await Application.find({
      userId: user.id,
      isActive: true
    })
      .populate('jobId', 'title company location type workMode status')
      .sort('-appliedDate');

    // Get statistics
    const stats = await Application.getUserStats(user.id);

    res.json({
      status: 'success',
      data: applications,
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/applications/:id
 * Get a specific application
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company location description requirements')
      .populate('userId', 'name email avatar location')
      .populate('resumeId')
      .select('-__v');

    if (!application || !application.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Check permissions
    if (user.role === 'job_seeker' && application.userId._id.toString() !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this application'
      });
    }

    if (user.role === 'employer') {
      const job = await Job.findById(application.jobId._id);
      if (job.postedBy.toString() !== user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this application'
        });
      }
      // Mark as viewed
      await application.markAsViewed();
    }

    res.json({
      status: 'success',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * PUT /api/applications/:id/status
 * Update application status (Employer only)
 */
router.put('/:id/status', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can update application status'
      });
    }

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application || !application.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Verify job belongs to employer
    if (application.jobId.postedBy.toString() !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this application'
      });
    }

    // Update status
    await application.updateStatus(status, notes);

    res.json({
      status: 'success',
      data: application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * PUT /api/applications/:id/interview
 * Schedule/update interview (Employer only)
 */
router.put('/:id/interview', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can schedule interviews'
      });
    }

    const { scheduledDate, interviewType, location, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application || !application.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    // Verify job belongs to employer
    if (application.jobId.postedBy.toString() !== user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to schedule interview for this application'
      });
    }

    // Update interview details
    application.interview = {
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      interviewType: interviewType || null,
      location: location || null,
      notes: notes || null,
      completed: application.interview?.completed || false
    };

    // Update status to interview if not already
    if (application.status !== 'interview') {
      application.status = 'interview';
    }

    await application.save();

    res.json({
      status: 'success',
      data: application,
      message: 'Interview scheduled successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/applications/:id
 * Withdraw application (Job Seeker only) or delete (Employer)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application || !application.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    if (user.role === 'job_seeker') {
      // Job seeker can withdraw their own application
      if (application.userId.toString() !== user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only withdraw your own applications'
        });
      }

      application.status = 'withdrawn';
      application.isActive = false;
      await application.save();

      res.json({
        status: 'success',
        message: 'Application withdrawn successfully'
      });
    } else if (user.role === 'employer') {
      // Employer can delete applications for their jobs
      if (application.jobId.postedBy.toString() !== user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to delete this application'
        });
      }

      application.isActive = false;
      await application.save();

      res.json({
        status: 'success',
        message: 'Application deleted successfully'
      });
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid user role'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

