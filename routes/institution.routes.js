const express = require('express');
const router = express.Router();
const {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getInstitutionsByCountry
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getInstitutions);
router.get('/country/:country', getInstitutionsByCountry);
router.get('/:slug', getInstitution);

// Admin routes
router.post('/', protect, authorize('admin', 'super_admin'), createInstitution);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateInstitution);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteInstitution);

module.exports = router;