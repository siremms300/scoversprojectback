// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const fields = ['firstName', 'lastName', 'phone', 'nationality', 'state', 'city'];
    const updateData = {};
    
    fields.forEach(field => {
      if (req.body[field]) updateData[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;