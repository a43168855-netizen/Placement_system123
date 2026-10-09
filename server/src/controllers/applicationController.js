const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter = '' } = req.body;

    if (!jobId) {
      return errorResponse(res, 400, 'Please provide a valid Job ID');
    }

    // 1. Check if job exists
    const job = await Job.findById(jobId).populate('company', 'name');
    if (!job) {
      return errorResponse(res, 404, 'Job listing not found');
    }

    if (job.status !== 'active') {
      return errorResponse(res, 400, 'This job listing is no longer accepting applications');
    }

    // 2. Check application deadline
    if (new Date(job.deadline) < new Date()) {
      return errorResponse(res, 400, 'Application deadline for this position has passed');
    }

    // 3. Find student profile
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return errorResponse(
        res,
        400,
        'Please complete your student profile before applying for jobs'
      );
    }

    // 4. Validate eligibility (CGPA & Department)
    if (job.minCgpa && profile.cgpa < job.minCgpa) {
      return errorResponse(
        res,
        400,
        `Your CGPA (${profile.cgpa}) does not meet the minimum requirement (${job.minCgpa}) for this job.`
      );
    }

    if (
      job.eligibleDepartments &&
      job.eligibleDepartments.length > 0 &&
      !job.eligibleDepartments.includes(profile.department)
    ) {
      return errorResponse(
        res,
        400,
        `Your department (${profile.department}) is not eligible for this position. Eligible: ${job.eligibleDepartments.join(', ')}`
      );
    }

    // 5. Check duplicate application
    const existingApplication = await JobApplication.findOne({
      student: req.user._id,
      job: jobId,
    });

    if (existingApplication) {
      return errorResponse(
        res,
        400,
        'You have already submitted an application for this position'
      );
    }

    // Create application
    const application = await JobApplication.create({
      student: req.user._id,
      studentProfile: profile._id,
      job: jobId,
      coverLetter,
      status: 'pending',
      appliedDate: new Date(),
    });

    const populatedApplication = await JobApplication.findById(application._id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name location' },
      })
      .populate('student', 'name email');

    return successResponse(
      res,
      201,
      `Application submitted successfully to ${job.title} at ${job.company?.name || 'Company'}`,
      populatedApplication
    );
  } catch (error) {
    // Catch compound index duplicate key error gracefully
    if (error.code === 11000) {
      return errorResponse(res, 400, 'You have already submitted an application for this position');
    }
    next(error);
  }
};

// @desc    Get logged in student's applications
// @route   GET /api/applications/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const { status = '', page = 1, limit = 10, sortBy = 'appliedDate', order = 'desc' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = { student: req.user._id };
    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name location website industry' },
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, 200, 'My applications retrieved', applications, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Admin, Recruiter - own job)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status = '', search = '', page = 1, limit = 10, sortBy = 'appliedDate', order = 'desc' } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse(res, 404, 'Job listing not found');
    }

    // Role check: recruiter can only view applicants for their own job
    if (req.user.role === 'recruiter' && job.recruiter.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized. You can only view applicants for your own jobs.');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = { job: jobId };
    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        role: 'student',
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      const matchingProfiles = await StudentProfile.find({
        $or: [
          { rollNo: searchRegex },
          { department: searchRegex },
          { skills: { $in: [searchRegex] } },
        ],
      }).select('_id');
      const profileIds = matchingProfiles.map((p) => p._id);

      query.$or = [{ student: { $in: userIds } }, { studentProfile: { $in: profileIds } }];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate('student', 'name email status')
      .populate('studentProfile')
      .populate('job', 'title salary location')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, 200, 'Job applications retrieved', applications, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications across all jobs for the logged in recruiter
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
const getRecruiterApplications = async (req, res, next) => {
  try {
    const { status = '', search = '', jobId = '', page = 1, limit = 10, sortBy = 'appliedDate', order = 'desc' } = req.query;

    // Find all jobs owned by this recruiter
    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id title');
    const jobIds = recruiterJobs.map((j) => j._id);

    const query = { job: { $in: jobIds } };

    if (jobId) {
      query.job = jobId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        role: 'student',
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      query.student = { $in: userIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate('student', 'name email')
      .populate('studentProfile')
      .populate({
        path: 'job',
        select: 'title salary location company minCgpa deadline status',
        populate: { path: 'company', select: 'name' },
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, 200, 'Recruiter applications retrieved', applications, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private (Admin)
const getAllApplications = async (req, res, next) => {
  try {
    const {
      status = '',
      search = '',
      jobId = '',
      companyId = '',
      page = 1,
      limit = 10,
      sortBy = 'appliedDate',
      order = 'desc',
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (jobId) {
      query.job = jobId;
    }

    if (companyId) {
      const companyJobs = await Job.find({ company: companyId }).select('_id');
      const jIds = companyJobs.map((j) => j._id);
      query.job = { $in: jIds };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        role: 'student',
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      const matchingJobs = await Job.find({ title: searchRegex }).select('_id');
      const matchingJobIds = matchingJobs.map((j) => j._id);

      query.$or = [{ student: { $in: userIds } }, { job: { $in: matchingJobIds } }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate('student', 'name email')
      .populate('studentProfile')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name location' },
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, 200, 'All applications retrieved', applications, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Admin, Recruiter - own job, Student - own app)
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await JobApplication.findById(id)
      .populate('student', 'name email')
      .populate('studentProfile')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name location website' },
      });

    if (!application) {
      return errorResponse(res, 404, 'Application not found');
    }

    // Role permission check
    if (req.user.role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized to view this application');
    }

    if (req.user.role === 'recruiter') {
      const job = await Job.findById(application.job._id);
      if (job.recruiter.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Unauthorized to view applications for jobs from other recruiters');
      }
    }

    return successResponse(res, 200, 'Application details retrieved', application);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status and recruiter remarks
// @route   PATCH /api/applications/:id/status
// @access  Private (Admin, Recruiter - own job)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks = '' } = req.body;

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'selected'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(
        res,
        400,
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }

    const application = await JobApplication.findById(id).populate({
      path: 'job',
      populate: { path: 'company', select: 'name' },
    });

    if (!application) {
      return errorResponse(res, 404, 'Application not found');
    }

    // Recruiter authorization check
    if (req.user.role === 'recruiter' && application.job.recruiter.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized. You can only update applications for your own jobs.');
    }

    application.status = status;
    if (remarks !== undefined) {
      application.recruiterRemarks = remarks;
    }
    await application.save();

    // If status is 'selected', automatically update the student's placement status
    if (status === 'selected') {
      await StudentProfile.findOneAndUpdate(
        { user: application.student },
        {
          placementStatus: 'placed',
          placedCompany: application.job.company?.name || 'Partner Company',
          placedPackage: application.job.salary || 0,
        }
      );
    }

    const updatedApplication = await JobApplication.findById(id)
      .populate('student', 'name email')
      .populate('studentProfile')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name' },
      });

    return successResponse(
      res,
      200,
      `Application status updated to '${status}' successfully`,
      updatedApplication
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getRecruiterApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
};
