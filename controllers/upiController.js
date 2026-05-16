const UPIProgram = require('../models/UPIProgram');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Get all UPI programs (public)
// @route   GET /api/upi
// @access  Public
exports.getPrograms = async (req, res) => {
  try {
    const { 
      level, field, mode, status, search,
      page = 1, limit = 10, sort = '-createdAt'
    } = req.query;

    const query = {};
    
    if (level) query.level = level;
    if (field) query.field = field;
    if (mode) query.mode = mode;
    if (status) query.status = status;
    else query.status = 'active'; // Default to active programs
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { field: { $regex: search, $options: 'i' } }
      ];
    }

    const programs = await UPIProgram.find(query)
      .populate('institution', 'name country logo')
      .select('-enrolledStudents -curriculum')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UPIProgram.countDocuments(query);

    res.status(200).json({
      success: true,
      data: programs,
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
};

// @desc    Get single UPI program
// @route   GET /api/upi/:slug
// @access  Public
// exports.getProgram = async (req, res) => {
//   try {
//     const program = await UPIProgram.findOne({ slug: req.params.slug })
//       .populate('institution', 'name country logo description website')
//       .populate('transferableTo.institution', 'name country logo');

//     if (!program) {
//       return res.status(404).json({ success: false, message: 'Program not found' });
//     }

//     res.status(200).json({ success: true, data: program });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// @desc    Get single UPI program
// @route   GET /api/upi/:slug
// @access  Public
exports.getProgram = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try to find by MongoDB ID first, then by slug
    let program;
    
    // Check if the param looks like a MongoDB ObjectId (24 hex chars)
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      program = await UPIProgram.findById(slug)
        .populate('institution', 'name country logo description website')
        .populate('transferableTo.institution', 'name country logo');
    }
    
    // If not found by ID, try by slug
    if (!program) {
      program = await UPIProgram.findOne({ slug })
        .populate('institution', 'name country logo description website')
        .populate('transferableTo.institution', 'name country logo');
    } 

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






// @desc    Create UPI program (admin)
// @route   POST /api/upi
// @access  Private/Admin
// exports.createProgram = async (req, res) => {
//   try {
//     const program = await UPIProgram.create(req.body);
//     res.status(201).json({ success: true, data: program });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


exports.createProgram = async (req, res) => {
  try {
    console.log('=== CREATE UPI PROGRAM ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.id, req.user?.role);
    
    const program = await UPIProgram.create(req.body);
    
    console.log('Program created:', program._id);
    
    res.status(201).json({ 
      success: true, 
      data: program 
    });
  } catch (error) {
    console.error('=== CREATE PROGRAM ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Validation errors:', error.errors);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.errors || error.message
    });
  }
};

// @desc    Update UPI program (admin)
// @route   PUT /api/upi/:id
// @access  Private/Admin
exports.updateProgram = async (req, res) => {
  try {
    const program = await UPIProgram.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete UPI program (admin)
// @route   DELETE /api/upi/:id
// @access  Private/Admin
exports.deleteProgram = async (req, res) => {
  try {
    const program = await UPIProgram.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.status(200).json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in UPI program
// @route   POST /api/upi/:id/enroll
// @access  Private
exports.enrollProgram = async (req, res) => {
  try {
    const program = await UPIProgram.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    if (program.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Program is not currently accepting enrollments' });
    }

    // Check if already enrolled
    const alreadyEnrolled = program.enrolledStudents.find(
      e => e.user.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this program' });
    }

    // Check max students
    if (program.maxStudents && program.enrolledStudents.length >= program.maxStudents) {
      return res.status(400).json({ success: false, message: 'Program has reached maximum capacity' });
    }

    // Enroll student
    program.enrolledStudents.push({
      user: req.user.id,
      enrollmentDate: new Date(),
      status: 'active'
    });

    await program.save();

    // Create application record
    await Application.create({
      userId: req.user.id,
      programType: 'UPI',
      source: req.body.source || 'organic',
      status: 'submitted',
      targetInstitution: program.institution,
      sourceDetails: req.body.sourceDetails || {}
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in program',
      data: program
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student progress
// @route   PUT /api/upi/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { moduleCode, grade, score, status } = req.body;
    
    const program = await UPIProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    const student = program.enrolledStudents.find(
      e => e.user.toString() === req.user.id
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Update or add module
    const existingModule = student.completedModules.find(m => m.module === moduleCode);
    if (existingModule) {
      existingModule.grade = grade;
      existingModule.score = score;
      existingModule.status = status;
      existingModule.completedDate = new Date();
    } else {
      student.completedModules.push({
        module: moduleCode,
        grade,
        score,
        status,
        completedDate: new Date()
      });
    }

    // Calculate overall progress
    const totalModules = program.curriculum.length;
    const completedCount = student.completedModules.filter(m => m.status === 'passed').length;
    student.progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    // Check if program completed
    if (student.progress >= 100) {
      student.status = 'completed';
      student.completionDate = new Date();
      
      // Calculate overall grade
      const totalScore = student.completedModules.reduce((sum, m) => sum + (m.score || 0), 0);
      const avgScore = totalScore / student.completedModules.length;
      
      if (avgScore >= 90) student.overallGrade = 'A';
      else if (avgScore >= 80) student.overallGrade = 'B';
      else if (avgScore >= 70) student.overallGrade = 'C';
      else if (avgScore >= 60) student.overallGrade = 'D';
      else student.overallGrade = 'F';
    }

    await program.save();

    res.status(200).json({
      success: true,
      data: {
        progress: student.progress,
        status: student.status,
        completedModules: student.completedModules,
        overallGrade: student.overallGrade
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my UPI progress
// @route   GET /api/upi/my-progress
// @access  Private
exports.getMyProgress = async (req, res) => {
  try {
    const programs = await UPIProgram.find({
      'enrolledStudents.user': req.user.id
    }).populate('institution', 'name country logo');

    const progress = programs.map(program => {
      const enrollment = program.enrolledStudents.find(
        e => e.user.toString() === req.user.id
      );
      return {
        program: {
          _id: program._id,
          name: program.name,
          slug: program.slug,
          credits: program.credits,
          duration: program.duration,
          level: program.level,
          institution: program.institution
        },
        enrollment: {
          progress: enrollment.progress,
          status: enrollment.status,
          overallGrade: enrollment.overallGrade,
          completedModules: enrollment.completedModules,
          enrollmentDate: enrollment.enrollmentDate,
          completionDate: enrollment.completionDate
        }
      };
    });

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get UPI analytics (Admin/Investor)
// @route   GET /api/upi/analytics
// @access  Private/Admin/Investor
exports.getUPIAnalytics = async (req, res) => {
  try {
    const totalPrograms = await UPIProgram.countDocuments({ status: 'active' });
    
    const enrollmentStats = await UPIProgram.aggregate([
      { $unwind: '$enrolledStudents' },
      { $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrolledStudents.status', 'completed'] }, 1, 0] }
        },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrolledStudents.status', 'active'] }, 1, 0] }
        }
      }}
    ]);

    const popularPrograms = await UPIProgram.aggregate([
      { $project: {
        name: 1,
        field: 1,
        level: 1,
        enrollmentCount: { $size: '$enrolledStudents' },
        averageRating: 1
      }},
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 }
    ]);

    const fieldDistribution = await UPIProgram.aggregate([
      { $group: { _id: '$field', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = enrollmentStats[0] || { totalEnrollments: 0, completedEnrollments: 0, activeEnrollments: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalPrograms,
        totalEnrollments: stats.totalEnrollments,
        completedEnrollments: stats.completedEnrollments,
        activeEnrollments: stats.activeEnrollments,
        completionRate: stats.totalEnrollments > 0 
          ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) 
          : 0,
        popularPrograms,
        fieldDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get program students (Admin/University)
// @route   GET /api/upi/:id/students
// @access  Private/Admin
exports.getProgramStudents = async (req, res) => {
  try {
    const program = await UPIProgram.findById(req.params.id)
      .populate('enrolledStudents.user', 'firstName lastName email avatar');

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    res.status(200).json({ success: true, data: program.enrolledStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate program
// @route   POST /api/upi/:id/rate
// @access  Private
exports.rateProgram = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const program = await UPIProgram.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Check if already rated
    const existingRating = program.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.date = new Date();
    } else {
      program.ratings.push({
        user: req.user.id,
        rating,
        review
      });
    }

    program.calculateRating();
    await program.save();

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};