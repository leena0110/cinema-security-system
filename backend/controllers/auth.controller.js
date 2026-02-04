const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailUtil = require('../utils/email.util');
const HashingUtil = require('../utils/hashing.util');

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Register User
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists.'
      });
    }

    // Password strength validation (NIST SP 800-63-2)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      isVerified: true // Set to true for demo, implement email verification in production
    });

    await user.save();

    // Hash user data for logging
    const userHash = HashingUtil.sha256(user._id.toString());
    console.log(`[REGISTRATION] User registered with hash: ${userHash}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.',
      data: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user.',
      error: error.message
    });
  }
};

// Login - Step 1: Verify credentials and send OTP
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password.'
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(user._id.toString(), {
      otp,
      expiry: otpExpiry,
      attempts: 0
    });

    // Log OTP to console for testing (remove in production!)
    console.log(`\n========================================`);
    console.log(`🔐 OTP for ${user.username}: ${otp}`);
    console.log(`========================================\n`);

    // Send OTP via email
    try {
      await emailUtil.sendOTP(user.email, otp, user.username);
      
      console.log(`[LOGIN] OTP sent to user: ${user.username}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete login.',
        data: {
          userId: user._id,
          email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
          requiresOTP: true
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login.',
      error: error.message
    });
  }
};

// Login - Step 2: Verify OTP and complete login
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and OTP.'
      });
    }

    // Get stored OTP
    const storedOTPData = otpStore.get(userId);

    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new one.'
      });
    }

    // Check expiry
    if (Date.now() > storedOTPData.expiry) {
      otpStore.delete(userId);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (storedOTPData.attempts >= 3) {
      otpStore.delete(userId);
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts += 1;
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        attemptsRemaining: 3 - storedOTPData.attempts
      });
    }

    // OTP is valid - complete login
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Clear OTP
    otpStore.delete(userId);

    // Hash session for logging
    const sessionHash = HashingUtil.sha256(token);
    console.log(`[LOGIN SUCCESS] User: ${user.username}, Session Hash: ${sessionHash.substring(0, 16)}...`);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP.',
      error: error.message
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    // Update OTP store
    otpStore.set(userId, {
      otp,
      expiry: otpExpiry,
      attempts: 0
    });

    // Send OTP via email
    await emailUtil.sendOTP(user.email, otp, user.username);

    console.log(`[RESEND OTP] OTP resent to user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP.',
      error: error.message
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data.',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout.',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  getCurrentUser,
  logout
};