const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { buildRecommendations } = require('../services/jobRecommendationService');

const calculateProfileCompletion = (profile) => {
  const sections = [
    profile.summary?.trim(),
    profile.skills?.length >= 3,
    profile.experience?.length > 0,
    profile.education?.length > 0,
    profile.preferences?.accessibilityRequirements?.length > 0,
    profile.jobPreferences?.desiredRoles?.length > 0
  ];
  const score = Math.round((sections.filter(Boolean).length / sections.length) * 100);
  return Number.isNaN(score) ? 0 : score;
};

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  user.profileCompletion = calculateProfileCompletion(user);
  return user;
};

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.json({
      status: 'success',
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const directFields = [
      'name',
      'headline',
      'summary',
      'location',
      'email',
      'phone',
      'disabilityType',
      'avatar'
    ];

    directFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        user[field] = req.body[field];
      }
    });

    if (Array.isArray(req.body.skills)) {
      user.skills = req.body.skills
        .map((skill) => skill?.trim())
        .filter(Boolean);
    }

    if (req.body.preferences) {
      const existingPreferences = typeof user.preferences?.toObject === 'function'
        ? user.preferences.toObject()
        : user.preferences || {};

      user.preferences = {
        ...existingPreferences,
        ...req.body.preferences,
        accessibilityRequirements: req.body.preferences.accessibilityRequirements ?? existingPreferences.accessibilityRequirements ?? [],
        preferredIndustries: req.body.preferences.preferredIndustries ?? existingPreferences.preferredIndustries ?? [],
        salaryRange: {
          ...(existingPreferences.salaryRange || {}),
          ...(req.body.preferences.salaryRange || {})
        }
      };
    }

    if (req.body.socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...req.body.socialLinks
      };
    }

    const arrayFields = ['experience', 'education', 'projects', 'certifications', 'languages', 'achievements'];
    arrayFields.forEach((field) => {
      if (Array.isArray(req.body[field])) {
        user[field] = req.body[field];
      }
    });

    if (req.body.jobPreferences) {
      const existingJobPreferences = typeof user.jobPreferences?.toObject === 'function'
        ? user.jobPreferences.toObject()
        : user.jobPreferences || {};

      user.jobPreferences = {
        ...existingJobPreferences,
        ...req.body.jobPreferences,
        desiredRoles: req.body.jobPreferences.desiredRoles ?? existingJobPreferences.desiredRoles ?? [],
        preferredLocations: req.body.jobPreferences.preferredLocations ?? existingJobPreferences.preferredLocations ?? [],
        workModes: req.body.jobPreferences.workModes ?? existingJobPreferences.workModes ?? [],
        salaryRange: {
          ...(existingJobPreferences.salaryRange || {}),
          ...(req.body.jobPreferences.salaryRange || {})
        }
      };
    }

    user.profileCompleted = calculateProfileCompletion(user);

    await user.save();

    res.json({
      status: 'success',
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
});

// Job recommendations derived from profile
router.get('/profile/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const recommendations = buildRecommendations(user);

    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
