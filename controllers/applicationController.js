const Application = require('../models/Application');
const cloudinary = require('../utils/cloudinary');

// @desc    Create application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    
    const application = await Application.create(req.body);

    // Add initial timeline
    application.timeline.push({
      status: application.status,
      note: 'Application created',
      updatedBy: req.user.id
    });
    await application.save();

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all applications (with filters)
// @route   GET /api/applications
// @access  Private/Admin
// exports.getApplications = async (req, res) => {
//   try {
//     const { 
//       status, 
//       source, 
//       probabilityScore, 
//       programType,
//       startDate,
//       endDate,
//       search,
//       page = 1,
//       limit = 10,
//       sort = '-createdAt'
//     } = req.query;

//     // Build query
//     const query = {};

//     if (status) query.status = status;
//     if (source) query.source = source;
//     if (probabilityScore) query.probabilityScore = probabilityScore;
//     if (programType) query.programType = programType;
    
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) query.createdAt.$gte = new Date(startDate);
//       if (endDate) query.createdAt.$lte = new Date(endDate);
//     }

//     if (search) {
//       query.$or = [
//         { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
//         { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
//         { 'personalInfo.email': { $regex: search, $options: 'i' } }
//       ];
//     }

//     // For non-admin users, only show their applications
//     if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
//       query.userId = req.user.id;
//     }

//     const applications = await Application.find(query)
//       .populate('userId', 'firstName lastName email')
//       .populate('targetInstitution', 'name country')
//       .populate('targetCourse', 'name level')
//       .sort(sort)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const total = await Application.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: applications,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };





// @desc    Get all applications (with filters)
// @route   GET /api/applications
// @access  Private/Admin/Investor
exports.getApplications = async (req, res) => {
  try {
    const { 
      status, 
      source, 
      probabilityScore, 
      programType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (probabilityScore) query.probabilityScore = probabilityScore;
    if (programType) query.programType = programType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // For students, only show their applications
    // For admin, super_admin, investor - show ALL applications
    if (req.user.role === 'student') {
      query.userId = req.user.id;
    }
    // Admin, super_admin, and investor see all applications - no userId filter

    console.log('User role:', req.user.role, 'Query:', JSON.stringify(query));

    const applications = await Application.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('targetInstitution', 'name country')
      .populate('targetCourse', 'name level')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};







// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('targetInstitution', 'name country logo')
      .populate('targetCourse', 'name level duration')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('timeline.updatedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership or admin
    if (
      application.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    if (status === 'submitted') {
      application.submissionDate = new Date();
    }

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/applications/:id/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `scovers/applications/${application._id}`
    });

    application.documents.push({
      type: req.body.documentType,
      name: req.file.originalname,
      url: result.secure_url,
      cloudinaryId: result.public_id
    });

    application.timeline.push({
      status: 'documents_uploaded',
      note: `${req.body.documentType} document uploaded`,
      updatedBy: req.user.id
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add note to application
// @route   POST /api/applications/:id/notes
// @access  Private/Admin
exports.addNote = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.notes.push({
      content: req.body.content,
      createdBy: req.user.id,
      visibility: req.body.visibility || 'admin'
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get application analytics
// @route   GET /api/applications/analytics/overview
// @access  Private/Admin/Investor
exports.getApplicationAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalApplications,
      weeklyApplications,
      monthlyApplications,
      sourceBreakdown,
      probabilityDistribution,
      statusBreakdown,
      conversionRate,
      weeklyGrowth
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $gte: lastWeek } }),
      Application.countDocuments({ createdAt: { $gte: lastMonth } }),
      Application.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Application.aggregate([
        { $group: { _id: '$probabilityScore', count: { $sum: 1 } } }
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Application.countDocuments({ status: 'completed' }),
      Application.aggregate([
        {
          $group: {
            _id: { $week: '$createdAt' },
            count: { $sum: 1 },
            week: { $first: '$createdAt' }
          }
        },
        { $sort: { '_id': -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        weeklyApplications,
        monthlyApplications,
        conversionRate: totalApplications > 0 
          ? ((conversionRate / totalApplications) * 100).toFixed(2)
          : 0,
        sourceBreakdown: sourceBreakdown.map(item => ({
          source: item._id,
          count: item.count,
          percentage: totalApplications > 0
            ? ((item.count / totalApplications) * 100).toFixed(2)
            : 0
        })),
        probabilityDistribution,
        statusBreakdown,
        weeklyGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Enroll student from accepted UPI application
// @route   POST /api/applications/:id/enroll
// @access  Private/Admin
exports.enrollFromApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    if (application.programType !== 'UPI') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application is not for UPI program' 
      });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Application must be accepted before enrollment' 
      });
    }

    // Find the UPI program
    const UPIProgram = require('../models/UPIProgram');
    let program;

    if (application.targetCourse) {
      program = await UPIProgram.findById(application.targetCourse);
    }

    if (!program) {
      return res.status(404).json({ 
        success: false, 
        message: 'UPI program not found. Please assign a target course to this application.' 
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = program.enrolledStudents.find(
      e => e.user.toString() === application.userId._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student is already enrolled in this program' 
      });
    }

    // Check max capacity
    if (program.maxStudents && program.enrolledStudents.length >= program.maxStudents) {
      return res.status(400).json({ 
        success: false, 
        message: 'Program has reached maximum capacity' 
      });
    }

    // Enroll the student
    program.enrolledStudents.push({
      user: application.userId._id,
      enrollmentDate: new Date(),
      progress: 0,
      status: 'active'
    });

    await program.save();

    // Update application status to completed
    application.status = 'completed';
    application.timeline.push({
      status: 'completed',
      date: new Date(),
      note: `Student enrolled in UPI Program: ${program.name}`,
      updatedBy: req.user.id
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully in UPI program',
      data: {
        application,
        program: {
          _id: program._id,
          name: program.name,
          credits: program.credits
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};