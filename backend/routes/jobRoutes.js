const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

/**
 * POST /api/jobs
 * Create a new job posting (Employer only)
 */
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is employer
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can post jobs'
      });
    }

    const jobData = {
      ...req.body,
      postedBy: user.id
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      status: 'success',
      data: job,
      message: 'Job posted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/jobs
 * Get all jobs (with optional filters)
 * Public endpoint - no auth required
 */
router.get('/', async (req, res) => {
  try {
    const {
      status = 'active',
      type,
      workMode,
      experienceLevel,
      location,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {
      status: status === 'all' ? { $in: ['active', 'closed'] } : status,
      isActive: true
    };

    if (type) query.type = type;
    if (workMode) query.workMode = workMode;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Job.countDocuments(query);

    res.json({
      status: 'success',
      data: jobs,
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
 * GET /api/jobs/my-jobs
 * Get jobs posted by current employer
 */
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can view their jobs'
      });
    }

    const jobs = await Job.find({ postedBy: user.id, isActive: true })
      .populate('postedBy', 'name email')
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email avatar company')
      .select('-__v');

    if (!job || !job.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      status: 'success',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * PUT /api/jobs/:id
 * Update a job (Employer only, own jobs only)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can update jobs'
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: user.id,
      isActive: true
    });

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found or you do not have permission to update it'
      });
    }

    // Update job
    Object.assign(job, req.body);
    await job.save();

    res.json({
      status: 'success',
      data: job,
      message: 'Job updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job (soft delete - Employer only, own jobs only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can delete jobs'
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: user.id,
      isActive: true
    });

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found or you do not have permission to delete it'
      });
    }

    // Soft delete
    job.isActive = false;
    job.status = 'closed';
    await job.save();

    res.json({
      status: 'success',
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /api/jobs/:id/stats
 * Get statistics for a job (Employer only)
 */
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'employer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only employers can view job statistics'
      });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: user.id
    });

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    const stats = await Application.getJobStats(req.params.id);

    res.json({
      status: 'success',
      data: {
        job: {
          id: job._id,
          title: job.title,
          views: job.views,
          applicationCount: job.applicationCount
        },
        applications: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

