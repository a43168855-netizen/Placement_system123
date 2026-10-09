const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNo: {
      type: String,
      required: [true, 'Please provide student roll number / ID'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    course: {
      type: String,
      required: [true, 'Please provide course name'],
      trim: true,
      default: 'B.Tech',
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please provide graduation year'],
    },
    cgpa: {
      type: Number,
      required: [true, 'Please provide CGPA'],
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'opted_out'],
      default: 'unplaced',
    },
    placedCompany: {
      type: String,
      default: '',
    },
    placedPackage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
