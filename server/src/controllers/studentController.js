const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const JobApplication = require('../models/JobApplication');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all students with filtering, search, and pagination
// @route   GET /api/students
// @access  Private (Admin, Recruiter)
const getAllStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      placementStatus = '',
      minCgpa = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter for StudentProfile
    const profileQuery = {};

    if (department) {
      profileQuery.department = department;
    }

    if (placementStatus) {
      profileQuery.placementStatus = placementStatus;
    }

    if (minCgpa) {
      profileQuery.cgpa = { $gte: parseFloat(minCgpa) };
    }

    // If search keyword provided, we need to search user name/email or profile rollNo/skills
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        role: 'student',
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      profileQuery.$or = [
        { user: { $in: userIds } },
        { rollNo: searchRegex },
        { department: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await StudentProfile.countDocuments(profileQuery);
    const profiles = await StudentProfile.find(profileQuery)
      .populate('user', 'name email status createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, 200, 'Students fetched successfully', profiles, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by ID (profile ID or User ID)
// @route   GET /api/students/:id
// @access  Private (Admin, Recruiter, Student)
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let profile = await StudentProfile.findById(id).populate('user', 'name email status role createdAt');
    if (!profile) {
      // Try finding by user ID
      profile = await StudentProfile.findOne({ user: id }).populate('user', 'name email status role createdAt');
    }

    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found');
    }

    // Role check: student can only view their own profile unless admin/recruiter
    if (req.user.role === 'student' && profile.user._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized to view this student profile');
    }

    // Fetch applications for this student if Admin or Student itself
    let applications = [];
    if (req.user.role === 'admin' || (req.user.role === 'student' && profile.user._id.toString() === req.user._id.toString())) {
      applications = await JobApplication.find({ student: profile.user._id })
        .populate({
          path: 'job',
          select: 'title salary location status company deadline',
          populate: { path: 'company', select: 'name' },
        })
        .sort({ appliedDate: -1 });
    }

    return successResponse(res, 200, 'Student details retrieved', {
      profile,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student (User + Profile)
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Password@123',
      rollNo,
      course = 'B.Tech',
      department,
      graduationYear = 2026,
      cgpa = 0,
      skills = [],
      phone = '',
      bio = '',
      placementStatus = 'unplaced',
      placedCompany = '',
      placedPackage = 0,
    } = req.body;

    if (!name || !email || !rollNo || !department) {
      return errorResponse(res, 400, 'Please provide name, email, roll number, and department.');
    }

    // Check user & rollNo existence
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return errorResponse(res, 400, 'A user with this email already exists.');
    }

    const rollExists = await StudentProfile.findOne({ rollNo: rollNo.toUpperCase().trim() });
    if (rollExists) {
      return errorResponse(res, 400, 'A student with this Roll Number already exists.');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      status: 'active',
    });

    const profile = await StudentProfile.create({
      user: user._id,
      rollNo: rollNo.toUpperCase().trim(),
      course,
      department: department.trim(),
      graduationYear: Number(graduationYear),
      cgpa: Number(cgpa),
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s) => s.trim()).filter(Boolean) : []),
      phone,
      bio,
      placementStatus,
      placedCompany,
      placedPackage: Number(placedPackage) || 0,
    });

    const populatedProfile = await StudentProfile.findById(profile._id).populate('user', 'name email status role');

    return successResponse(res, 201, 'Student created successfully', populatedProfile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student (Admin or authorized)
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let profile = await StudentProfile.findById(id);

    if (!profile) {
      profile = await StudentProfile.findOne({ user: id });
    }

    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found');
    }

    const {
      name,
      email,
      status,
      rollNo,
      course,
      department,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
      phone,
      bio,
      placementStatus,
      placedCompany,
      placedPackage,
    } = req.body;

    // Update user if name/email/status provided
    const userToUpdate = await User.findById(profile.user);
    if (userToUpdate) {
      if (name) userToUpdate.name = name.trim();
      if (email && email.toLowerCase() !== userToUpdate.email) {
        const emailConflict = await User.findOne({ email: email.toLowerCase().trim() });
        if (emailConflict) {
          return errorResponse(res, 400, 'Email is already in use by another account');
        }
        userToUpdate.email = email.toLowerCase().trim();
      }
      if (status) userToUpdate.status = status;
      await userToUpdate.save();
    }

    // Check unique rollNo if changed
    if (rollNo && rollNo.toUpperCase().trim() !== profile.rollNo) {
      const rollConflict = await StudentProfile.findOne({ rollNo: rollNo.toUpperCase().trim() });
      if (rollConflict) {
        return errorResponse(res, 400, 'Roll number is already taken');
      }
      profile.rollNo = rollNo.toUpperCase().trim();
    }

    if (course !== undefined) profile.course = course;
    if (department !== undefined) profile.department = department;
    if (graduationYear !== undefined) profile.graduationYear = Number(graduationYear);
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;
    if (placementStatus !== undefined) profile.placementStatus = placementStatus;
    if (placedCompany !== undefined) profile.placedCompany = placedCompany;
    if (placedPackage !== undefined) profile.placedPackage = Number(placedPackage);

    await profile.save();

    const updatedProfile = await StudentProfile.findById(profile._id).populate('user', 'name email status role');
    return successResponse(res, 200, 'Student updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let profile = await StudentProfile.findById(id);
    if (!profile) {
      profile = await StudentProfile.findOne({ user: id });
    }

    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found');
    }

    const userId = profile.user;

    // Delete associated applications
    await JobApplication.deleteMany({ student: userId });

    // Delete profile and user
    await StudentProfile.findByIdAndDelete(profile._id);
    await User.findByIdAndDelete(userId);

    return successResponse(res, 200, 'Student and associated data deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student profile
// @route   GET /api/students/profile/me
// @access  Private (Student)
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email status role createdAt');
    if (!profile) {
      // Create empty profile if not yet created
      profile = await StudentProfile.create({
        user: req.user._id,
        rollNo: `STU-${Date.now().toString().slice(-6)}`,
        course: 'B.Tech',
        department: 'Computer Science',
        graduationYear: 2026,
        cgpa: 7.0,
      });
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email status role createdAt');
    }

    return successResponse(res, 200, 'Student profile retrieved', profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged in student profile
// @route   PUT /api/students/profile/me
// @access  Private (Student)
const updateMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Student profile not found');
    }

    const {
      name,
      course,
      department,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
      phone,
      bio,
    } = req.body;

    // Update name on user account
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    if (course !== undefined) profile.course = course;
    if (department !== undefined) profile.department = department;
    if (graduationYear !== undefined) profile.graduationYear = Number(graduationYear);
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;

    await profile.save();

    const updatedProfile = await StudentProfile.findById(profile._id).populate('user', 'name email status role');
    return successResponse(res, 200, 'Profile updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
};
