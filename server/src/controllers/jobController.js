const Job = require('../models/Job');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const StudentProfile = require('../models/StudentProfile');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all jobs with filtering, search, pagination
// @route   GET /api/jobs
// @access  Public / Authenticated
const getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      location = '',
      jobType = '',
      status = '',
      recruiter = '',
      company = '',
      minSalary = '',
      maxCgpa = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // By default, if student or public, only show active jobs
    if (req.user && req.user.role === 'student') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (recruiter) {
      query.recruiter = recruiter;
    }

    if (company) {
      query.company = company;
    }

    if (minSalary) {
      query.salary = { $gte: parseFloat(minSalary) };
    }

    if (maxCgpa) {
      // Jobs whose minCgpa requirement is <= the student's cgpa
      query.minCgpa = { $lte: parseFloat(maxCgpa) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');

      // Also search matching companies
      const matchingCompanies = await Company.find({
        name: searchRegex,
      }).select('_id');
      const companyIds = matchingCompanies.map((c) => c._id);

      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
        { company: { $in: companyIds } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name location website industry')
      .populate('recruiter', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // If logged in student, attach hasApplied status
    let userApplicationsMap = {};
    if (req.user && req.user.role === 'student') {
      const userApps = await JobApplication.find({ student: req.user._id }).select('job status');
      userApplicationsMap = userApps.reduce((acc, app) => {
        acc[app.job.toString()] = app.status;
        return acc;
      }, {});
    }

    // Attach total applicants count for recruiter or admin
    const jobsWithMeta = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await JobApplication.countDocuments({ job: job._id });
        const jobObj = job.toObject();
        jobObj.applicantCount = applicantCount;
        if (req.user && req.user.role === 'student') {
          jobObj.appliedStatus = userApplicationsMap[job._id.toString()] || null;
          jobObj.hasApplied = !!userApplicationsMap[job._id.toString()];
        }
        return jobObj;
      })
    );

    return paginatedResponse(res, 200, 'Jobs retrieved successfully', jobsWithMeta, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public / Authenticated
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id)
      .populate('company', 'name location website industry description')
      .populate('recruiter', 'name email');

    if (!job) {
      return errorResponse(res, 404, 'Job listing not found');
    }

    const jobObj = job.toObject();
    const applicantCount = await JobApplication.countDocuments({ job: job._id });
    jobObj.applicantCount = applicantCount;

    // If student, check application and eligibility status
    if (req.user && req.user.role === 'student') {
      const application = await JobApplication.findOne({
        student: req.user._id,
        job: job._id,
      });

      const studentProfile = await StudentProfile.findOne({ user: req.user._id });

      let isEligible = true;
      const eligibilityReasons = [];

      if (studentProfile) {
        if (job.minCgpa && studentProfile.cgpa < job.minCgpa) {
          isEligible = false;
          eligibilityReasons.push(`CGPA (${studentProfile.cgpa}) is below minimum requirement (${job.minCgpa})`);
        }

        if (
          job.eligibleDepartments &&
          job.eligibleDepartments.length > 0 &&
          !job.eligibleDepartments.includes(studentProfile.department)
        ) {
          isEligible = false;
          eligibilityReasons.push(`Department (${studentProfile.department}) is not among eligible departments: ${job.eligibleDepartments.join(', ')}`);
        }
      }

      if (new Date(job.deadline) < new Date()) {
        isEligible = false;
        eligibilityReasons.push('Application deadline has passed');
      }

      jobObj.hasApplied = !!application;
      jobObj.application = application || null;
      jobObj.isEligible = isEligible;
      jobObj.eligibilityReasons = eligibilityReasons;
    }

    return successResponse(res, 200, 'Job details retrieved', jobObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job listing
// @route   POST /api/jobs
// @access  Private (Admin, Recruiter)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyId,
      companyName,
      description,
      minCgpa = 0,
      eligibleDepartments = [],
      requiredSkills = [],
      salary,
      location,
      jobType = 'Full-time',
      deadline,
      openings = 1,
      status = 'active',
    } = req.body;

    if (!title || !description || salary === undefined || !location || !deadline) {
      return errorResponse(
        res,
        400,
        'Please provide title, description, salary, location, and application deadline.'
      );
    }

    // Resolve company
    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId) {
      if (companyName) {
        let existingCompany = await Company.findOne({ name: companyName.trim() });
        if (!existingCompany) {
          existingCompany = await Company.create({
            name: companyName.trim(),
            location: location || 'Headquarters',
            recruiter: req.user._id,
          });
        }
        resolvedCompanyId = existingCompany._id;
      } else {
        // If recruiter, find their company
        const recruiterCompany = await Company.findOne({ recruiter: req.user._id });
        if (recruiterCompany) {
          resolvedCompanyId = recruiterCompany._id;
        } else {
          return errorResponse(res, 400, 'Please select or provide a company for this job.');
        }
      }
    }

    const job = await Job.create({
      title: title.trim(),
      company: resolvedCompanyId,
      recruiter: req.user._id,
      description,
      minCgpa: Number(minCgpa) || 0,
      eligibleDepartments: Array.isArray(eligibleDepartments)
        ? eligibleDepartments
        : typeof eligibleDepartments === 'string'
        ? eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean)
        : [],
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === 'string'
        ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      salary: Number(salary),
      location: location.trim(),
      jobType,
      deadline: new Date(deadline),
      openings: Number(openings) || 1,
      status,
    });

    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name location website industry')
      .populate('recruiter', 'name email');

    return successResponse(res, 201, 'Job created successfully', populatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Update job listing
// @route   PUT /api/jobs/:id
// @access  Private (Admin, Recruiter - own jobs only)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return errorResponse(res, 404, 'Job not found');
    }

    // Strict recruiter ownership check
    if (req.user.role === 'recruiter' && job.recruiter.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized. You can only manage your own job listings.');
    }

    const {
      title,
      companyId,
      description,
      minCgpa,
      eligibleDepartments,
      requiredSkills,
      salary,
      location,
      jobType,
      deadline,
      openings,
      status,
    } = req.body;

    if (title !== undefined) job.title = title.trim();
    if (companyId !== undefined) job.company = companyId;
    if (description !== undefined) job.description = description;
    if (minCgpa !== undefined) job.minCgpa = Number(minCgpa);
    if (eligibleDepartments !== undefined) {
      job.eligibleDepartments = Array.isArray(eligibleDepartments)
        ? eligibleDepartments
        : eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean);
    }
    if (requiredSkills !== undefined) {
      job.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (salary !== undefined) job.salary = Number(salary);
    if (location !== undefined) job.location = location.trim();
    if (jobType !== undefined) job.jobType = jobType;
    if (deadline !== undefined) job.deadline = new Date(deadline);
    if (openings !== undefined) job.openings = Number(openings);
    if (status !== undefined) job.status = status;

    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name location website industry')
      .populate('recruiter', 'name email');

    return successResponse(res, 200, 'Job updated successfully', populatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Admin, Recruiter - own jobs only)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return errorResponse(res, 404, 'Job not found');
    }

    // Strict recruiter ownership check
    if (req.user.role === 'recruiter' && job.recruiter.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized. You can only delete your own job listings.');
    }

    // Delete all applications for this job
    await JobApplication.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(job._id);

    return successResponse(res, 200, 'Job listing and applications removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
