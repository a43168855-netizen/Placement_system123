const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getRecruiterApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student submits application
router.post('/', protect, authorize('student'), applyForJob);

// Student personal application history
router.get('/my-applications', protect, authorize('student'), getMyApplications);

// Recruiter applications across all their jobs
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterApplications);

// Admin all applications
router.get('/', protect, authorize('admin'), getAllApplications);

// Applications for a specific job (Recruiter or Admin)
router.get('/job/:jobId', protect, authorize('admin', 'recruiter'), getJobApplications);

// View specific application details
router.get('/:id', protect, getApplicationById);

// Update application status & recruiter remarks (Admin or Recruiter)
router.patch('/:id/status', protect, authorize('admin', 'recruiter'), updateApplicationStatus);

module.exports = router;
