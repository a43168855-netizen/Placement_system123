const Company = require('../models/Company');
const Job = require('../models/Job');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all companies with search and pagination
// @route   GET /api/companies
// @access  Public (or Private)
const getAllCompanies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      industry = '',
      sortBy = 'name',
      order = 'asc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (industry) {
      query.industry = industry;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { location: searchRegex },
        { industry: searchRegex },
        { description: searchRegex },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .populate('recruiter', 'name email status')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Attach active job count to each company
    const companiesWithJobCount = await Promise.all(
      companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ company: company._id, status: 'active' });
        return {
          ...company.toObject(),
          activeJobsCount: jobCount,
        };
      })
    );

    return paginatedResponse(res, 200, 'Companies retrieved successfully', companiesWithJobCount, {
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID
// @route   GET /api/companies/:id
// @access  Public (or Private)
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).populate('recruiter', 'name email status');

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Company details retrieved', {
      company,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Admin, Recruiter)
const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, location, industry, contactEmail } = req.body;

    if (!name) {
      return errorResponse(res, 400, 'Please provide company name');
    }

    const existingCompany = await Company.findOne({ name: name.trim() });
    if (existingCompany) {
      return errorResponse(res, 400, 'Company with this name already exists');
    }

    // Assign recruiter: if recruiter role, current user; if admin, can be specified or current admin
    let recruiterId = req.user.role === 'recruiter' ? req.user._id : req.body.recruiter || req.user._id;

    const company = await Company.create({
      name: name.trim(),
      description: description || '',
      website: website || '',
      location: location || '',
      industry: industry || 'Technology',
      contactEmail: contactEmail || req.user.email,
      recruiter: recruiterId,
    });

    const populatedCompany = await Company.findById(company._id).populate('recruiter', 'name email');

    return successResponse(res, 201, 'Company created successfully', populatedCompany);
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Admin, Recruiter - own company)
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    // Role check: recruiter can only update their own company
    if (
      req.user.role === 'recruiter' &&
      company.recruiter &&
      company.recruiter.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Unauthorized to modify this company profile');
    }

    const { name, description, website, location, industry, contactEmail, recruiter } = req.body;

    if (name && name.trim() !== company.name) {
      const exists = await Company.findOne({ name: name.trim() });
      if (exists) {
        return errorResponse(res, 400, 'Another company with this name already exists');
      }
      company.name = name.trim();
    }

    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (location !== undefined) company.location = location;
    if (industry !== undefined) company.industry = industry;
    if (contactEmail !== undefined) company.contactEmail = contactEmail;

    // Admin can reassign recruiter
    if (req.user.role === 'admin' && recruiter !== undefined) {
      company.recruiter = recruiter;
    }

    await company.save();
    const updatedCompany = await Company.findById(company._id).populate('recruiter', 'name email');

    return successResponse(res, 200, 'Company updated successfully', updatedCompany);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return errorResponse(res, 404, 'Company not found');
    }

    // Delete company jobs and applications
    const jobs = await Job.find({ company: company._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);
    const JobApplication = require('../models/JobApplication');
    await JobApplication.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ company: company._id });
    await Company.findByIdAndDelete(company._id);

    return successResponse(res, 200, 'Company and associated jobs deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current recruiter's company
// @route   GET /api/companies/my-company
// @access  Private (Recruiter)
const getMyCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne({ recruiter: req.user._id });

    if (!company) {
      // Create a default company for the recruiter if none exists yet
      company = await Company.create({
        name: `${req.user.name}'s Organization`,
        contactEmail: req.user.email,
        recruiter: req.user._id,
        industry: 'Technology',
        location: 'Bengaluru / Remote',
      });
    }

    return successResponse(res, 200, 'Company retrieved', company);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyCompany,
};
