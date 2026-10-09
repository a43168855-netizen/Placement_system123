const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyCompany,
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getAllCompanies);
router.get('/my-company', protect, authorize('recruiter'), getMyCompany);
router.post('/', protect, authorize('admin', 'recruiter'), createCompany);
router.get('/:id', getCompanyById);
router.put('/:id', protect, authorize('admin', 'recruiter'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

module.exports = router;
