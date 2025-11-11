const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const smsService = require('../services/smsService');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, disabilityType, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Create new user (password will be hashed by User model's pre-save hook)
    user = new User({
      name,
      email,
      password,
      disabilityType: disabilityType || 'none',
      phone: phone || undefined
    });

    await user.save();

    // Create JWT token
    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          status: 'success',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Check if user exists (password field is included)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Validate password using model method or bcrypt
    let isMatch = false;
    if (user.comparePassword) {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Create JWT token
    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          status: 'success',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

// Get current user (verify token)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// Verify token (legacy endpoint, redirects to /me)
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or phone number is required'
      });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with the provided email or phone number'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = {
      code: otpCode,
      expiresAt: expiresAt
    };
    await user.save();

    // Send OTP via SMS if phone number is provided
    let smsSent = false;
    let smsError = null;

    if (phone && user.phone) {
      try {
        // Format phone number to E.164 if needed
        let formattedPhone = user.phone;
        if (!smsService.isValidPhoneNumber(formattedPhone)) {
          formattedPhone = smsService.formatPhoneNumber(formattedPhone);
        }

        // Send SMS via Twilio
        const smsResult = await smsService.sendOTP(formattedPhone, otpCode);
        smsSent = smsResult.success;
        
        if (!smsResult.success && !smsResult.fallback) {
          smsError = smsResult.error;
        }
      } catch (error) {
        console.error('SMS sending error:', error);
        smsError = error.message;
        // Continue even if SMS fails - OTP is still saved
      }
    }

    // Log OTP for email-based recovery or fallback
    if (email || !smsSent) {
      console.log(`OTP for ${user.email || user.phone}: ${otpCode} (expires in 10 minutes)`);
    }

    // Prepare response
    const response = {
      status: 'success',
      message: phone && smsSent 
        ? 'OTP sent successfully via SMS' 
        : phone && smsError
        ? `OTP generated. SMS sending failed: ${smsError}. Check console for OTP.`
        : 'OTP generated successfully. Check your email or console for OTP.',
      expiresIn: 600 // 10 minutes in seconds
    };

    // Only return OTP in development mode for testing (if SMS not sent)
    if (process.env.NODE_ENV === 'development' && !smsSent) {
      response.otp = otpCode;
    }

    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp || (!email && !phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP and email or phone number are required'
      });
    }

    // Find user
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        status: 'error',
        message: 'No OTP found. Please request a new OTP'
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      user.otp = { code: null, expiresAt: null };
      await user.save();
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired. Please request a new OTP'
      });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP. Please try again'
      });
    }

    // OTP is valid - create a temporary token for password reset
    const resetToken = jwt.sign(
      { id: user.id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // 15 minutes
    );

    res.json({
      status: 'success',
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid reset token'
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token. Please request a new OTP'
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    // Clear OTP
    user.otp = { code: null, expiresAt: null };
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successfully. You can now login with your new password'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;
