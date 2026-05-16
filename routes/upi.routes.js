const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  enrollProgram,
  updateProgress,
  getMyProgress,
  getUPIAnalytics,
  getProgramStudents,
  rateProgram
} = require('../controllers/upiController');
const { protect, authorize } = require('../middleware/auth');

// ============ NAMED ROUTES FIRST (before /:id) ============

// Public
router.get('/', getPrograms);

// Protected - named routes MUST come before /:id
router.get('/analytics/data', protect, authorize('admin', 'super_admin', 'investor'), getUPIAnalytics);
router.get('/my-progress', protect, getMyProgress);

// Admin only
router.post('/', protect, authorize('admin', 'super_admin'), createProgram);

// ============ PARAMETERIZED ROUTES LAST ============

// Student actions
router.post('/:id/enroll', protect, enrollProgram);
router.put('/:id/progress', protect, updateProgress);
router.post('/:id/rate', protect, rateProgram);

// Admin/University
router.get('/:id/students', protect, authorize('admin', 'super_admin', 'university_admin'), getProgramStudents);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateProgram);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProgram);

// Public - this MUST be last to not catch named routes
router.get('/:slug', getProgram);

module.exports = router;











































// const express = require('express');
// const router = express.Router();
// const {
//   getPrograms,
//   getProgram,
//   createProgram,
//   updateProgram,
//   deleteProgram,
//   enrollProgram,
//   updateProgress,
//   getMyProgress,
//   getUPIAnalytics,
//   getProgramStudents,
//   rateProgram
// } = require('../controllers/upiController');
// const { protect, authorize } = require('../middleware/auth');

// // Public routes - NO auth required
// router.get('/', getPrograms);
// router.get('/:slug', getProgram);

// // Protected routes - Auth required
// router.get('/analytics/data', protect, authorize('admin', 'super_admin', 'investor'), getUPIAnalytics);
// router.get('/my-progress', protect, getMyProgress);

// // Admin only routes
// router.post('/', protect, authorize('admin', 'super_admin'), createProgram);
// router.put('/:id', protect, authorize('admin', 'super_admin'), updateProgram);
// router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProgram);

// // Student routes
// router.post('/:id/enroll', protect, enrollProgram);
// router.put('/:id/progress', protect, updateProgress);
// router.post('/:id/rate', protect, rateProgram);

// // Admin/University routes
// router.get('/:id/students', protect, authorize('admin', 'super_admin', 'university_admin'), getProgramStudents);

// module.exports = router;














































// const express = require('express');
// const router = express.Router();
// const {
//   getPrograms,
//   getProgram,
//   createProgram,
//   updateProgram,
//   deleteProgram,
//   enrollProgram,
//   updateProgress,
//   getMyProgress,
//   getUPIAnalytics,
//   getProgramStudents,
//   rateProgram
// } = require('../controllers/upiController');
// const { protect, authorize } = require('../middleware/auth');

// // Public routes
// router.get('/', getPrograms);
// router.get('/analytics', protect, authorize('admin', 'super_admin', 'investor'), getUPIAnalytics);
// router.get('/my-progress', protect, getMyProgress);
// router.get('/:slug', getProgram);

// // Protected routes
// router.post('/', protect, authorize('admin', 'super_admin'), createProgram);
// router.put('/:id', protect, authorize('admin', 'super_admin'), updateProgram);
// router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteProgram);
// router.post('/:id/enroll', protect, enrollProgram);
// router.put('/:id/progress', protect, updateProgress);
// router.get('/:id/students', protect, authorize('admin', 'super_admin', 'university_admin'), getProgramStudents);
// router.post('/:id/rate', protect, rateProgram);

// module.exports = router;