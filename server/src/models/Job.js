const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please assign a company'],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must have a managing recruiter'],
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
    },
    minCgpa: {
      type: Number,
      default: 0,
      min: [0, 'Minimum CGPA cannot be negative'],
      max: [10, 'Minimum CGPA cannot exceed 10'],
    },
    eligibleDepartments: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    salary: {
      type: Number,
      required: [true, 'Please provide package/salary offer in LPA'],
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract', 'Part-time'],
      default: 'Full-time',
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify application deadline'],
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1'],
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
