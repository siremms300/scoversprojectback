const mongoose = require('mongoose');

const upiProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String, 
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  duration: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ['undergraduate', 'graduate', 'professional', 'certificate'],
    required: true
  },
  field: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'hybrid', 'in_person'],
    default: 'online'
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  tuition: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    per: {
      type: String,
      enum: ['total', 'year', 'semester', 'module'],
      default: 'total'
    }
  },
  requirements: [String],
  prerequisites: [String],
  startDates: [Date],
  enrollmentDeadline: Date,
  maxStudents: Number,
  thumbnail: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  transferableTo: [{
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution'
    },
    creditsAccepted: Number,
    conditions: String,
    notes: String
  }],
  curriculum: [{
    module: String,
    code: String,
    description: String,
    credits: Number,
    duration: String,
    order: Number,
    assessments: [{
      type: { type: String, enum: ['quiz', 'assignment', 'exam', 'project'] },
      name: String,
      weight: Number
    }]
  }],
  enrolledStudents: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedModules: [{
      module: String,
      completedDate: Date,
      grade: String,
      score: Number,
      status: {
        type: String,
        enum: ['passed', 'failed', 'in_progress'],
        default: 'in_progress'
      }
    }],
    overallGrade: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'on_hold'],
      default: 'active'
    },
    certificateUrl: String,
    completionDate: Date
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
upiProgramSchema.pre('validate', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Add timestamp to make unique
    this.slug = `${this.slug}-${Date.now()}`;
  }
  next();
});

// Calculate average rating
upiProgramSchema.methods.calculateRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = Math.round((total / this.ratings.length) * 10) / 10;
};

// Text index for search
upiProgramSchema.index({ name: 'text', description: 'text', field: 'text' });
upiProgramSchema.index({ status: 1, level: 1 });
upiProgramSchema.index({ field: 1, mode: 1 });

module.exports = mongoose.model('UPIProgram', upiProgramSchema);