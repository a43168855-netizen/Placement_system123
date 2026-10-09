const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudentDashboard,
  getRecruiterDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterDashboard);

module.exports = router;
