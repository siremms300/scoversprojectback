const Institution = require('../models/Institution');

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
exports.getInstitutions = async (req, res) => {
  try {
    const {
      country,
      type,
      search,
      featured,
      page = 1,
      limit = 10,
      sort = '-ranking.global'
    } = req.query;

    const query = { status: 'active' };

    if (country) query.country = country;
    if (type) query.type = type;
    if (featured) query.featured = featured === 'true';

    if (search) {
      query.$text = { $search: search };
    }

    const institutions = await Institution.find(query)
      .select('-courses -universityAdmins')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Institution.countDocuments(query);

    res.status(200).json({
      success: true,
      data: institutions,
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

// @desc    Get single institution
// @route   GET /api/institutions/:slug
// @access  Public
exports.getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findOne({ slug: req.params.slug })
      .populate('courses', 'name level field duration tuition')
      .populate('scholarships', 'title type amount deadline');

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create institution
// @route   POST /api/institutions
// @access  Private/Admin
exports.createInstitution = async (req, res) => {
  try {
    // Generate slug from name
    req.body.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');

    const institution = await Institution.create(req.body);

    res.status(201).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Private/Admin
exports.updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete institution
// @route   DELETE /api/institutions/:id
// @access  Private/Admin
exports.deleteInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get institutions by country
// @route   GET /api/institutions/country/:country
// @access  Public
exports.getInstitutionsByCountry = async (req, res) => {
  try {
    const institutions = await Institution.find({
      country: req.params.country,
      status: 'active'
    }).select('name slug type city logo ranking');

    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};