const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a student user'],
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: false,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must reference a job'],
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'selected'],
      default: 'pending',
    },
    recruiterRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    coverLetter: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by same student for same job
jobApplicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
