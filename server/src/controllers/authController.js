const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      // Student profile fields if student
      rollNo,
      course = 'B.Tech',
      department,
      graduationYear = 2026,
      cgpa = 0,
      skills = [],
      phone = '',
      // Recruiter fields if recruiter
      companyName,
      companyLocation,
    } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password.');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters.');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 400, 'A user with this email address already exists.');
    }

    // Check rollNo uniqueness if student
    if (role === 'student' && rollNo) {
      const existingRoll = await StudentProfile.findOne({ rollNo: rollNo.toUpperCase().trim() });
      if (existingRoll) {
        return errorResponse(res, 400, 'A student with this Roll Number / ID already exists.');
      }
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      status: 'active',
    });

    let profileData = null;

    // If student, create StudentProfile
    if (role === 'student') {
      const generatedRoll = rollNo ? rollNo.toUpperCase().trim() : `STU-${Date.now().toString().slice(-6)}`;
      const studentProfile = await StudentProfile.create({
        user: user._id,
        rollNo: generatedRoll,
        course,
        department: department || 'Computer Science',
        graduationYear: Number(graduationYear) || 2026,
        cgpa: Number(cgpa) || 7.5,
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
        phone,
      });
      profileData = studentProfile;
    }

    // If recruiter and companyName provided, create or link company
    if (role === 'recruiter' && companyName) {
      let company = await Company.findOne({ name: companyName.trim() });
      if (!company) {
        company = await Company.create({
          name: companyName.trim(),
          location: companyLocation || 'Remote',
          recruiter: user._id,
        });
      } else if (!company.recruiter) {
        company.recruiter = user._id;
        await company.save();
      }
      profileData = company;
    }

    const token = generateToken(user);

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile: profileData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (user.status === 'inactive') {
      return errorResponse(res, 403, 'Your account is deactivated. Please contact admin.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await Company.findOne({ recruiter: user._id });
    }

    return successResponse(res, 200, 'Logged in successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await Company.findOne({ recruiter: user._id });
    }

    return successResponse(res, 200, 'Current user retrieved', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
