// server/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const Institution = require('../models/Institution');
const Course = require('../models/Course');
const Scholarship = require('../models/Scholarship');
const Blog = require('../models/Blog');
const UPIProgram = require('../models/UPIProgram');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Dashboard Overview
router.get('/stats', async (req, res) => {
  try {
    const [
      totalApplications,
      totalUsers,
      totalInstitutions,
      totalScholarships,
      totalUPIPrograms,
      recentApplications
    ] = await Promise.all([
      Application.countDocuments(),
      User.countDocuments(),
      Institution.countDocuments(),
      Scholarship.countDocuments(),
      UPIProgram.countDocuments(),
      Application.find().sort('-createdAt').limit(10).populate('userId', 'firstName lastName email')
    ]);

    res.json({
      success: true,
      data: {
        totalApplications,
        totalUsers,
        totalInstitutions,
        totalScholarships,
        totalUPIPrograms,
        recentApplications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive, isVerified } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isVerified === 'boolean') updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Institutions
router.post('/institutions', async (req, res) => {
  try {
    const institution = await Institution.create(req.body);
    res.status(201).json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/institutions/:id', async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }
    res.json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/institutions/:id', async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Institution deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Scholarships
router.post('/scholarships', async (req, res) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/scholarships/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage Blog
router.post('/blog', async (req, res) => {
  try {
    req.body.author = req.user.id;
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage UPI Programs
router.post('/upi', async (req, res) => {
  try {
    const program = await UPIProgram.create(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Application Management
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id,
      date: new Date()
    });

    await application.save();
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;