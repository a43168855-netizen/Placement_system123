const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Student profile management by authenticated student
router.get('/profile/me', protect, authorize('student'), getMyProfile);
router.put('/profile/me', protect, authorize('student'), updateMyProfile);

// Student list and CRUD
router.get('/', protect, authorize('admin', 'recruiter'), getAllStudents);
router.post('/', protect, authorize('admin'), createStudent);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, authorize('admin'), updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
