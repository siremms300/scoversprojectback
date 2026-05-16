const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplication,
  updateApplicationStatus,
  uploadDocument,
  addNote,
  getApplicationAnalytics,
  enrollFromApplication  // Add this 
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .post(createApplication)
  .get(getApplications);

// Fixed: include super_admin
router.get('/analytics/overview', authorize('admin', 'super_admin', 'investor'), getApplicationAnalytics);

router.route('/:id')
  .get(getApplication);

// Fixed: include super_admin
router.put('/:id/status', authorize('admin', 'super_admin', 'university_admin'), updateApplicationStatus);
router.post('/:id/documents', upload.single('document'), uploadDocument);
router.post('/:id/notes', authorize('admin', 'super_admin'), addNote);
router.post('/:id/enroll', authorize('admin', 'super_admin'), enrollFromApplication); // Add this 


module.exports = router;






























// const express = require('express');
// const router = express.Router();
// const {
//   createApplication,
//   getApplications,
//   getApplication,
//   updateApplicationStatus,
//   uploadDocument,
//   addNote,
//   getApplicationAnalytics
// } = require('../controllers/applicationController');
// const { protect, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// router.use(protect);

// router.route('/')
//   .post(createApplication)
//   .get(getApplications);

// router.get('/analytics/overview', authorize('admin', 'super_admin', 'investor'), getApplicationAnalytics);

// router.route('/:id')
//   .get(getApplication);

// router.put('/:id/status', authorize('admin', 'super_admin'), updateApplicationStatus);
// router.post('/:id/documents', upload.single('document'), uploadDocument);
// router.post('/:id/notes', authorize('admin', 'super_admin'), addNote);

// module.exports = router;