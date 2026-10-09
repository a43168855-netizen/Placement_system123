const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role = '', status = '', search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort(sortObj).skip(skip).limit(limitNum);

    return paginatedResponse(res, 200, 'Users retrieved successfully', users, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    let extra = null;
    if (user.role === 'student') {
      extra = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      extra = await Company.findOne({ recruiter: user._id });
    }

    return successResponse(res, 200, 'User retrieved', { user, profile: extra });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user by Admin
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', status = 'active' } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse(res, 400, 'Email is already registered');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      status,
    });

    if (role === 'student') {
      await StudentProfile.create({
        user: user._id,
        rollNo: `STU-${Date.now().toString().slice(-6)}`,
        course: 'B.Tech',
        department: 'Computer Science',
        graduationYear: 2026,
        cgpa: 7.0,
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, 201, 'User created successfully', userObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailConflict = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailConflict) {
        return errorResponse(res, 400, 'Email is already in use by another account');
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, 200, 'User updated successfully', userObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot delete your own admin account');
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Clean up dependent resources
    if (user.role === 'student') {
      await StudentProfile.deleteMany({ user: id });
      await JobApplication.deleteMany({ student: id });
    } else if (user.role === 'recruiter') {
      const jobs = await Job.find({ recruiter: id }).select('_id');
      const jobIds = jobs.map((j) => j._id);
      await JobApplication.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ recruiter: id });
      await Company.updateMany({ recruiter: id }, { $unset: { recruiter: '' } });
    }

    await User.findByIdAndDelete(id);

    return successResponse(res, 200, 'User and associated data deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
