const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Optional auth for getAllJobs and getJobById so student info (applied/eligible) can be populated if token is present
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getAllJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', protect, authorize('admin', 'recruiter'), createJob);
router.put('/:id', protect, authorize('admin', 'recruiter'), updateJob);
router.delete('/:id', protect, authorize('admin', 'recruiter'), deleteJob);

module.exports = router;
