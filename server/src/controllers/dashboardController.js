const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get Admin Dashboard Statistics and Recent Activity
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await JobApplication.countDocuments();

    // Placement statistics
    const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'placed' });
    const unplacedStudents = await StudentProfile.countDocuments({ placementStatus: 'unplaced' });
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // Package stats
    const jobsWithSalary = await Job.find().select('salary');
    const salaries = jobsWithSalary.map((j) => j.salary).filter((s) => typeof s === 'number' && !isNaN(s));
    const highestPackage = salaries.length > 0 ? Math.max(...salaries) : 0;
    const avgPackage = salaries.length > 0 ? (salaries.reduce((a, b) => a + b, 0) / salaries.length).toFixed(1) : 0;

    // Applications status breakdown
    const applicationStatusCounts = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = { pending: 0, shortlisted: 0, selected: 0, rejected: 0 };
    applicationStatusCounts.forEach((item) => {
      if (item._id) statusMap[item._id] = item.count;
    });

    // Department-wise distribution
    const departmentDistribution = await StudentProfile.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    // Recent 5 applications
    const recentApplications = await JobApplication.find()
      .populate('student', 'name email')
      .populate('studentProfile', 'rollNo department cgpa')
      .populate({
        path: 'job',
        select: 'title salary',
        populate: { path: 'company', select: 'name' },
      })
      .sort({ appliedDate: -1 })
      .limit(5);

    // Recent 5 jobs
    const recentJobs = await Job.find()
      .populate('company', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 200, 'Admin dashboard statistics retrieved', {
      metrics: {
        totalStudents,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        placedStudents,
        unplacedStudents,
        placementRate: Number(placementRate),
        highestPackage: Number(highestPackage),
        avgPackage: Number(avgPackage),
      },
      applicationStatusCounts: statusMap,
      departmentStats: departmentDistribution.map((d) => ({
        department: d._id || 'Unknown',
        total: d.total,
        placed: d.placed,
        rate: d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0,
      })),
      recentApplications,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Dashboard Statistics
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentUserId = req.user._id;

    // Student profile
    const profile = await StudentProfile.findOne({ user: studentUserId });

    // Applications submitted by this student
    const applications = await JobApplication.find({ student: studentUserId })
      .populate({
        path: 'job',
        select: 'title salary location deadline status',
        populate: { path: 'company', select: 'name location website' },
      })
      .sort({ appliedDate: -1 });

    const totalApplications = applications.length;

    // Status breakdown
    const statusCounts = { pending: 0, shortlisted: 0, selected: 0, rejected: 0 };
    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    // Available jobs count & recent eligible jobs
    const activeJobsQuery = { status: 'active', deadline: { $gte: new Date() } };
    const totalAvailableJobs = await Job.countDocuments(activeJobsQuery);

    const recentJobs = await Job.find(activeJobsQuery)
      .populate('company', 'name location website')
      .sort({ createdAt: -1 })
      .limit(6);

    // Check which ones student applied for
    const appliedJobIds = new Set(applications.map((a) => a.job?._id?.toString()));
    const recentJobsWithMeta = recentJobs.map((job) => ({
      ...job.toObject(),
      hasApplied: appliedJobIds.has(job._id.toString()),
      isEligible: profile ? (profile.cgpa >= (job.minCgpa || 0)) : true,
    }));

    return successResponse(res, 200, 'Student dashboard statistics retrieved', {
      profile,
      metrics: {
        totalApplications,
        pending: statusCounts.pending,
        shortlisted: statusCounts.shortlisted,
        selected: statusCounts.selected,
        rejected: statusCounts.rejected,
        totalAvailableJobs,
      },
      recentApplications: applications.slice(0, 5),
      recentJobs: recentJobsWithMeta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Recruiter Dashboard Statistics
// @route   GET /api/dashboard/recruiter
// @access  Private (Recruiter)
const getRecruiterDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // Find recruiter company
    const company = await Company.findOne({ recruiter: recruiterId });

    // Find recruiter jobs
    const jobs = await Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 });
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'active').length;

    // Applicants across recruiter's jobs
    const applications = await JobApplication.find({ job: { $in: jobIds } })
      .populate('student', 'name email')
      .populate('studentProfile')
      .populate('job', 'title salary location')
      .sort({ appliedDate: -1 });

    const totalApplicants = applications.length;

    const statusCounts = { pending: 0, shortlisted: 0, selected: 0, rejected: 0 };
    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    return successResponse(res, 200, 'Recruiter dashboard statistics retrieved', {
      company,
      metrics: {
        totalJobs,
        activeJobs,
        totalApplicants,
        pending: statusCounts.pending,
        shortlisted: statusCounts.shortlisted,
        selected: statusCounts.selected,
        rejected: statusCounts.rejected,
      },
      recentApplicants: applications.slice(0, 6),
      jobs: jobs.slice(0, 6),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
  getRecruiterDashboard,
};
